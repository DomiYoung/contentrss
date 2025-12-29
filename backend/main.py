"""
ContentRSS 后端 - AI 情报分析服务
基于 Flask + OpenAI 兼容 API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime
from database import init_db, get_db_connection, get_placeholder, is_postgres
import hashlib
from typing import Any, Dict, List, Optional

# 条件导入 PostgreSQL 专用模块
if is_postgres():
    from psycopg2.extras import execute_values, RealDictCursor
    from psycopg2.pool import ThreadedConnectionPool

from services.entities import EntityService
from services.tag_service import tag_service
from topics import topic_service

# 加载环境变量
load_dotenv()

# 配置
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL')
DEFAULT_MODEL = os.getenv('DEFAULT_MODEL', 'qwen-max')  # 升级到更强模型
SPECIAL_API_URL = os.getenv('SPECIAL_API_URL')
SPECIAL_CHAIN_ID = int(os.getenv('SPECIAL_CHAIN_ID', '1036'))
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

# 验证配置
if not OPENAI_API_KEY:
    raise ValueError("缺少 OPENAI_API_KEY 配置")
if not OPENAI_BASE_URL:
    raise ValueError("缺少 OPENAI_BASE_URL 配置")

# 初始化 OpenAI 客户端
ai_client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL
)

# 创建 Flask 应用
app = Flask(__name__)

# 生产环境 CORS 配置
# 注意：strip() 处理环境变量中可能的空格/换行
PROD_ORIGINS = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', 'http://localhost:16889,http://localhost:5173').split(',')]
CORS(app, origins=PROD_ORIGINS, supports_credentials=True)

# 统一响应工具
from utils.response import success, error, not_found, bad_request, internal_error, register_error_handlers, validate_json
register_error_handlers(app)


def get_category_mapping() -> Dict[str, str]:
    """获取分类映射（从数据库，替代硬编码）"""
    return tag_service.get_category_mapping()


def get_category_label(category_key: str) -> str:
    """获取分类显示名称"""
    mapping = get_category_mapping()
    return mapping.get(category_key, category_key)


# ========== 数据库连接管理 (SQLite / PostgreSQL 双模式) ==========
from contextlib import contextmanager

DB_URL = os.getenv('DATABASE_URL')
_db_pool = None

def get_pool():
    global _db_pool
    if is_postgres():
        if _db_pool is None:
            print("💡 初始化 PostgreSQL 连接池...")
            _db_pool = ThreadedConnectionPool(1, 10, DB_URL, sslmode='require')
        return _db_pool
    return None  # SQLite 不使用连接池

@contextmanager
def db_conn():
    if is_postgres():
        pool = get_pool()
        conn = pool.getconn()
        conn.cursor_factory = RealDictCursor
        try:
            yield conn
        finally:
            pool.putconn(conn)
    else:
        # SQLite 模式：每次请求新建连接
        conn = get_db_connection()
        try:
            yield conn
        finally:
            conn.close()

# ================================


entity_service = EntityService()


def _coerce_special_payload(data: Any) -> Dict[str, List[Dict[str, Any]]]:
    if isinstance(data, list):
        return {"insight": data}
    if isinstance(data, dict):
        return {k: v for k, v in data.items() if isinstance(v, list)}
    return {}


def parse_datetime(value: Any) -> Optional[datetime]:
    """解析日期时间，兼容 datetime 对象和各种字符串格式"""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        # 移除可能的微秒或时区后缀以便统一解析
        clean_val = value.split('.')[0].replace('Z', '').replace('T', ' ')
        try:
            return datetime.strptime(clean_val, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            try:
                return datetime.fromisoformat(value)
            except:
                return None
    return None


def get_raw_articles_by_category() -> Dict[str, List[Dict[str, Any]]]:
    """统一获取所有分类的原始文章数据（极致优化：缓存命中仅 1 次 RTT）"""
    category_keys = list(get_category_mapping().keys())
    
    # 1. 单次查询获取数据 + 状态
    db_data, last_sync_map = fetch_all_raw_articles_with_metadata(category_keys)
    
    # 2. 检查同步需求 (每天仅需同步一次)
    now = datetime.now()
    needs_sync_keys = []
    
    for key in category_keys:
        last_sync = last_sync_map.get(key)
        # 如果没数据，或者上次同步不是今天
        if not last_sync or last_sync.date() < now.date():
            needs_sync_keys.append(key)
    
    if needs_sync_keys:
        print(f"🔄 需要同步 ({len(needs_sync_keys)}个分类): {needs_sync_keys}")
        try:
            response = fetch_special_data()
            sync_data = _coerce_special_payload(parse_special_response(response))
            for key in needs_sync_keys:
                items = sync_data.get(key) or []
                if items:
                    persist_raw_items(key, items)
            # 只有同步发生时才进行第二次查询
            db_data, _ = fetch_all_raw_articles_with_metadata(category_keys)
        except Exception as e:
            print(f"⚠️ 同步失败: {e}")

    return db_data

def get_articles_for_category(category_key: str) -> List[Dict[str, Any]]:
    """获取单分类数据（复用批量逻辑以节省连接）"""
    data = get_raw_articles_by_category()
    return data.get(category_key, [])


def fetch_special_category_items(category_key: str) -> List[Dict[str, Any]]:
    response = fetch_special_data()
    data = _coerce_special_payload(parse_special_response(response))
    return data.get(category_key, []) if data else []


def _row_value(row: Any, key: str) -> Any:
    if isinstance(row, dict):
        return row.get(key)
    try:
        return row[key]
    except Exception:
        return None


def fetch_all_raw_articles_with_metadata(category_keys: List[str], limit_per_cat: int = 40) -> tuple[Dict[str, List[Dict[str, Any]]], Dict[str, datetime]]:
    """批量从数据库读取文章和最新的同步时间"""
    try:
        if not category_keys:
            return {}, {}
        
        ph = get_placeholder()  # SQLite: ? / PostgreSQL: %s
        placeholders = ", ".join([ph] * len(category_keys))
        
        # SQLite 和 PostgreSQL 都支持 WITH 和 ROW_NUMBER() 窗口函数
        query = f"""
            WITH ranked_articles AS (
                SELECT 
                    category_key, 
                    raw_payload,
                    ingested_at,
                    ROW_NUMBER() OVER(PARTITION BY category_key ORDER BY ingested_at DESC) as rank
                FROM raw_articles
                WHERE category_key IN ({placeholders})
            )
            SELECT category_key, raw_payload, ingested_at, rank
            FROM ranked_articles
            WHERE rank <= {ph}
        """
        
        db_data: Dict[str, List[Dict[str, Any]]] = {key: [] for key in category_keys}
        last_sync_map: Dict[str, datetime] = {}
        
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(query, (*category_keys, limit_per_cat))
            rows = cur.fetchall()
            
        for row in rows:
            cat = row["category_key"]
            payload = row["raw_payload"]
            ingested_at = row["ingested_at"]
            rank = row["rank"]
            
            # 记录该分类最新的同步时间（rank=1 的即为最新）
            if rank == 1:
                last_sync_map[cat] = parse_datetime(ingested_at)
            
            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except:
                    payload = {"raw_payload": payload}
            
            if isinstance(payload, dict):
                # 将 ingested_at 添加到返回数据中
                payload["ingested_at"] = str(ingested_at) if ingested_at else None
                db_data[cat].append(payload)
                
        return db_data, last_sync_map
    except Exception as e:
        print(f"⚠️ 批量读取 raw_articles 失败: {e}")
        return {}, {}


def get_all_synced_recently(category_keys: List[str]) -> List[str]:
    """批量检查哪些分类今天已经同步过"""
    _, last_sync_map = fetch_all_raw_articles_with_metadata(category_keys, limit_per_cat=1)
    today = datetime.now().date()
    return [k for k, v in last_sync_map.items() if v.date() >= today]


def is_synced_recently(category_key: str) -> bool:
    """单个检查"""
    return category_key in get_all_synced_recently([category_key])



def persist_raw_items(category_key: str, items: List[Dict[str, Any]]) -> None:
    """批量保存文章，支持 SQLite 和 PostgreSQL"""
    if not items:
        return
    try:
        data_to_insert = []
        for item in items:
            normalized = normalize_article(item, category_key)
            if not normalized:
                continue
            payload = json.dumps(item, ensure_ascii=False)
            data_to_insert.append((
                normalized["source_name"],
                normalized["source_url"],
                normalized["title"],
                normalized["summary"],
                normalized["content"],
                category_key,
                payload,
                None # published_at
            ))

        if not data_to_insert:
            return

        with db_conn() as conn:
            cur = conn.cursor()
            if is_postgres():
                # PostgreSQL: 使用 execute_values 批量插入
                query = """
                    INSERT INTO raw_articles 
                    (source_name, source_url, title, summary, content, category_key, raw_payload, published_at) 
                    VALUES %s
                    ON CONFLICT (source_url) DO UPDATE SET 
                    source_name = EXCLUDED.source_name, 
                    title = EXCLUDED.title, 
                    summary = EXCLUDED.summary, 
                    content = EXCLUDED.content, 
                    category_key = EXCLUDED.category_key, 
                    raw_payload = EXCLUDED.raw_payload, 
                    published_at = EXCLUDED.published_at, 
                    ingested_at = CURRENT_TIMESTAMP
                """
                execute_values(cur, query, data_to_insert)
            else:
                # SQLite: 逐条插入 (INSERT OR REPLACE)
                query = """
                    INSERT OR REPLACE INTO raw_articles 
                    (source_name, source_url, title, summary, content, category_key, raw_payload, published_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """
                cur.executemany(query, data_to_insert)
            conn.commit()
            print(f"✅ 已存入 {len(data_to_insert)} 条数据到分类 {category_key}")
    except Exception as e:
        print(f"⚠️ 批量保存 raw_articles 失败: {e}")


def safe_json(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return {}
    return {}


def normalize_article(article: Dict[str, Any], category_key: str) -> Optional[Dict[str, Any]]:
    if not isinstance(article, dict):
        return None
        
    fields = article.get("fields", article)
    raw_info = fields.get("文章信息") or fields.get("article_info") or fields.get("info")
    info = safe_json(raw_info) if raw_info else {}

    title = info.get("文章标题") or fields.get("文章标题-moss用") or fields.get("title") or ""
    summary = info.get("摘要") or fields.get("摘要") or fields.get("summary") or ""
    content = fields.get("文章内容") or fields.get("content") or summary or ""
    source_name = info.get("作者名称") or fields.get("source_name") or fields.get("source") or ""
    source_url = info.get("文章URL") or fields.get("source_url") or fields.get("url")
    raw_id = fields.get("自增ID") or fields.get("id") or fields.get("article_id")

    if not title:
        return None

    try:
        article_id = int(raw_id) if raw_id is not None else None
    except Exception:
        article_id = None

    if article_id is None:
        id_source = f"{title}|{source_url or ''}"
        article_id = int(hashlib.md5(id_source.encode("utf-8")).hexdigest()[:8], 16)

    return {
        "id": article_id,
        "title": title,
        "summary": summary,
        "content": content,
        "source_name": source_name,
        "source_url": source_url,
        "category_key": category_key,
    }


def build_summary_payload(analysis: Dict[str, Any], raw_summary: str) -> str:
    polarity = analysis.get("polarity", "neutral")
    sentiment = "neutral"
    if polarity == "positive":
        sentiment = "bullish"
    elif polarity == "negative":
        sentiment = "bearish"

    thesis = analysis.get("opinion") or analysis.get("fact") or raw_summary or "暂无摘要"
    facts = []
    if analysis.get("fact"):
        facts.append(analysis["fact"])
    if raw_summary and raw_summary not in facts:
        facts.append(raw_summary)

    payload = {
        "thesis": thesis,
        "facts": facts[:3],
        "sentiment": sentiment
    }
    return json.dumps(payload, ensure_ascii=False)


def get_cached_analysis(source_url: str) -> Optional[Dict[str, Any]]:
    """获取缓存的 AI 分析结果"""
    if not source_url:
        return None
    
    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(f"""
                SELECT ai_polarity, ai_impacts, ai_opinion, ai_tags, ai_analyzed_at
                FROM raw_articles
                WHERE source_url = {ph} AND ai_analyzed_at IS NOT NULL
            """, (source_url,))
            row = cur.fetchone()
            
            if row:
                # 支持 dict 和 tuple 两种格式
                if isinstance(row, dict):
                    polarity = row.get("ai_polarity")
                    impacts_str = row.get("ai_impacts")
                    opinion = row.get("ai_opinion") or ""
                    tags_str = row.get("ai_tags")
                else:
                    polarity = row[0]
                    impacts_str = row[1]
                    opinion = row[2] or ""
                    tags_str = row[3]
                
                if polarity:  # ai_polarity 存在说明有缓存
                    return {
                        "polarity": polarity,
                        "impacts": json.loads(impacts_str) if impacts_str else [],
                        "opinion": opinion,
                        "tags": json.loads(tags_str) if tags_str else [],
                        "cached": True
                    }
    except Exception as e:
        print(f"⚠️ 读取 AI 缓存失败: {e}")
    
    return None


def save_analysis_cache(source_url: str, analysis: Dict[str, Any]) -> None:
    """保存 AI 分析结果到缓存"""
    if not source_url or not analysis:
        return
    
    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(f"""
                UPDATE raw_articles
                SET ai_polarity = {ph},
                    ai_impacts = {ph},
                    ai_opinion = {ph},
                    ai_tags = {ph},
                    ai_analyzed_at = CURRENT_TIMESTAMP
                WHERE source_url = {ph}
            """, (
                analysis.get("polarity", "neutral"),
                json.dumps(analysis.get("impacts", []), ensure_ascii=False),
                analysis.get("opinion", ""),
                json.dumps(analysis.get("tags", []), ensure_ascii=False),
                source_url
            ))
            conn.commit()
            print(f"✓ AI 分析已缓存: {source_url[:50]}...")
    except Exception as e:
        print(f"⚠️ 保存 AI 缓存失败: {e}")


def build_intelligence_cards(
    limit: int = 20,
    skip_ai: bool = False,
    category_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    if category_key and category_key != "all":
        data = {category_key: get_articles_for_category(category_key)}
    else:
        data = get_raw_articles_by_category()
    cards: List[Dict[str, Any]] = []
    index = 0

    for category_key, articles in data.items():
        if not isinstance(articles, list):
            continue

        for article in articles[:3]:
            normalized = normalize_article(article, category_key)
            if not normalized:
                continue

            index += 1
            article_id = normalized["id"] or index
            source_url = normalized.get("source_url")

            if skip_ai:
                analysis = {
                    "polarity": "neutral",
                    "impacts": [],
                    "tags": [],
                    "opinion": ""
                }
            else:
                # 1. 先检查缓存
                cached = get_cached_analysis(source_url)
                if cached:
                    analysis = cached
                    print(f"📦 使用缓存: {normalized['title'][:30]}...")
                else:
                    # 2. 无缓存则调用 AI
                    analysis = analyze_article(normalized["title"], normalized["summary"])
                    # 3. 保存到缓存
                    if source_url and analysis.get("polarity"):
                        save_analysis_cache(source_url, analysis)

            tags = analysis.get("tags") or []
            if category_key:
                category_label = get_category_label(category_key)
                if category_label not in tags:
                    tags.append(category_label)

            cards.append({
                "id": article_id,
                "title": normalized["title"],
                "polarity": analysis.get("polarity", "neutral"),
                "fact": analysis.get("fact") or normalized["summary"],
                "impacts": analysis.get("impacts", []),
                "opinion": analysis.get("opinion", ""),
                "tags": tags,
                "source_name": normalized["source_name"],
                "source_url": normalized["source_url"]
            })

            if len(cards) >= limit:
                return cards

    return cards


def find_article_by_id(article_id: int) -> Optional[Dict[str, Any]]:
    data = get_raw_articles_by_category()
    for category_key, articles in data.items():
        if not isinstance(articles, list):
            continue
        for article in articles:
            normalized = normalize_article(article, category_key)
            if not normalized:
                continue
            if normalized["id"] is not None and str(normalized["id"]) == str(article_id):
                return normalized
    return None


def build_daily_briefing(cards: List[Dict[str, Any]]) -> Dict[str, Any]:
    now = datetime.now()
    takeaways = [card.get("fact") for card in cards[:3] if card.get("fact")]
    read_time = f"{max(3, len(cards) * 2)} min read"

    impact_chain = {
        "trigger": cards[0]["title"] if cards else "今日暂无重点情报",
        "path": [
            f"{impact.get('entity')} {impact.get('trend')}"
            for impact in (cards[0].get("impacts", []) if cards else [])[:3]
        ] or ["等待更多数据"],
        "conclusion": cards[0].get("opinion") if cards else "稍后再试"
    }

    return {
        "date": now.strftime("%Y-%m-%d"),
        "title": "Daily Intelligence Briefing",
        "subtitle": "Today's five signals you should not miss.",
        "read_time": read_time,
        "synthesis": "基于今日高信号情报，系统已完成结构化筛选与影响链推演。",
        "takeaways": takeaways,
        "top_picks": cards,
        "impact_chain": impact_chain
    }


def fetch_special_data(content: str = "内容") -> dict:
    """调用 Special 接口获取原始数据"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ACCESS_TOKEN}'
    }
    payload = {
        "content": content,
        "chainId": SPECIAL_CHAIN_ID,
        "sync": True
    }
    
    try:
        resp = requests.post(SPECIAL_API_URL, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"❌ 获取 Special 数据失败: {e}")
        return {}


def parse_special_response(response: dict) -> dict:
    """解析 Special 接口返回的嵌套结构"""
    try:
        if response.get('res_status_code') != '0':
            return {}
        
        res_content = response.get('res_content', {})
        response_obj = res_content.get('response', {})
        
        if isinstance(response_obj, dict):
            content_field = response_obj.get('content', '')
            if isinstance(content_field, str):
                return json.loads(content_field)
            return content_field
        elif isinstance(response_obj, str):
            return json.loads(response_obj)
    except Exception as e:
        print(f"❌ 解析响应失败: {e}")
    
    return {}


def analyze_article(title: str, summary: str) -> dict:
    """
    使用外部 Analyst Prompt 模板深度分析文章
    定位：从“摘要员”进化为“分析师”
    """
    # 尝试加载外部提示词模板
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'analyst_v1.md')
    system_prompt = "You are a Senior Industry Analyst." # 兜底
    
    if os.path.exists(prompt_path):
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                system_prompt = f.read()
        except Exception as e:
            print(f"⚠️ 无法读取提示词文件: {e}")

    user_input = f"TITLE: {title}\nSUMMARY: {summary}"

    try:
        response = ai_client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            temperature=0.2, # 降低随机性，提高逻辑严谨性
            response_format={ "type": "json_object" } if "gpt-4o" in DEFAULT_MODEL or "qwen" in DEFAULT_MODEL else None
        )
        
        result = response.choices[0].message.content.strip()
        # 清理 markdown 代码块
        if result.startswith('```'):
            result = result.split('\n', 1)[1].rsplit('```', 1)[0]
        
        parsed = json.loads(result)
        
        # 兼容性处理：优先使用 opinion，若不存在则查找旧字段
        if 'actionable_insight' in parsed:
            parsed['opinion'] = parsed.pop('actionable_insight')
            
        return parsed
    except Exception as e:
        print(f"⚠️ AI 分析失败: {e}")
        return {
            "polarity": "neutral",
            "title": title[:15],
            "fact": summary[:40],
            "impacts": [],
            "opinion": "分析引擎响应异常",
            "tags": [],
            "confidence": "low"
        }


# ============ API 路由 ============

@app.route('/api/health', methods=['GET'])
def health():
    """健康检查"""
    return success(data={"status": "ok", "model": DEFAULT_MODEL})


@app.route('/api/sync/trigger', methods=['POST'])
def trigger_sync():
    """
    定时任务触发点 - 主动刷新数据
    可由 Vercel Cron / Railway Cron / 外部调度器调用
    需要 X-Cron-Key 头部验证（生产环境）
    """
    cron_secret = os.getenv('CRON_SECRET')
    if cron_secret and request.headers.get('X-Cron-Key') != cron_secret:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        data = get_raw_articles_by_category()
        synced_count = sum(len(articles) for articles in data.values())
        return success(
            data={"synced": True, "categories": list(data.keys()), "total_articles": synced_count},
            meta={"timestamp": datetime.now().isoformat()}
        )
    except Exception as e:
        return internal_error(str(e))


@app.route('/api/sync/status', methods=['GET'])
def sync_status():
    """获取各分类的最后同步时间"""
    category_keys = list(get_category_mapping().keys())
    _, last_sync_map = fetch_all_raw_articles_with_metadata(category_keys, limit_per_cat=1)
    
    now = datetime.now()
    status = {}
    for key in category_keys:
        last_sync = last_sync_map.get(key)
        status[key] = {
            "last_sync": last_sync.isoformat() if last_sync else None,
            "is_today": last_sync.date() >= now.date() if last_sync else False
        }
    
    return jsonify({
        "current_time": now.isoformat(),
        "categories": status
    })

@app.route('/api/raw-data', methods=['GET'])
def get_raw_data():
    """获取原始公众号数据（数据中心用）"""
    category = request.args.get('category', 'legal')
    items = get_articles_for_category(category)

    return success(
        data={"category": category, "label": get_category_label(category), "items": items},
        meta={"count": len(items)}
    )


@app.route('/api/intelligence', methods=['GET'])
def get_intelligence():
    """获取 AI 分析后的情报卡片（首页用）"""
    limit = int(request.args.get('limit', 20))
    # 生产环境可通过 DEFAULT_SKIP_AI=true 跳过 AI 分析（避免内网 API 超时）
    default_skip = os.getenv('DEFAULT_SKIP_AI', 'false').lower() == 'true'
    skip_ai = request.args.get('skip_ai', str(default_skip)).lower() == 'true'
    category = request.args.get('category')

    cards = build_intelligence_cards(limit=limit, skip_ai=skip_ai, category_key=category)

    return success(
        data={"cards": cards},
        meta={"count": len(cards)}
    )


@app.route('/api/feed', methods=['GET'])
def get_feed():
    """兼容旧前端的 Feed 接口（返回数组）"""
    limit = int(request.args.get('limit', 20))
    skip_ai = request.args.get('skip_ai', 'false').lower() == 'true'
    category = request.args.get('category')
    cards = build_intelligence_cards(limit=limit, skip_ai=skip_ai, category_key=category)
    return jsonify(cards)


@app.route('/api/article/<int:article_id>', methods=['GET'])
def get_article_detail(article_id: int):
    """获取详情页数据（与 /api/intelligence 同源）"""
    skip_ai = request.args.get('skip_ai', 'false').lower() == 'true'
    article = find_article_by_id(article_id)
    if not article:
        return jsonify({"error": "Article not found"}), 404

    if skip_ai:
        analysis = {
            "polarity": "neutral",
            "impacts": [],
            "tags": [],
            "opinion": ""
        }
    else:
        analysis = analyze_article(article["title"], article["summary"])

    tags = analysis.get("tags") or []
    category_label = get_category_label(article["category_key"])
    if category_label and category_label not in tags:
        tags.append(category_label)

    summary_payload = build_summary_payload(analysis, article["summary"])

    return jsonify({
        "id": article["id"],
        "title": article["title"],
        "polarity": analysis.get("polarity", "neutral"),
        "fact": analysis.get("fact") or article["summary"],
        "impacts": analysis.get("impacts", []),
        "opinion": analysis.get("opinion", ""),
        "tags": tags,
        "source_name": article["source_name"],
        "source_url": article["source_url"],
        "content": article["content"],
        "summary": summary_payload,
        "original_url": article["source_url"]
    })


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有分类（兼容旧 API）"""
    return jsonify({
        "categories": [
            {"id": k, "label": v} for k, v in get_category_mapping().items()
        ]
    })


@app.route('/api/tags', methods=['GET'])
def get_tags():
    """获取统一标签体系"""
    from tags import tag_service, CATEGORY_TAGS
    
    return jsonify({
        "categories": [tag_service.to_dict(tag) for tag in CATEGORY_TAGS],
        "systemTags": [
            {"id": "important", "name": "重要", "icon": "⭐", "color": "#F59E0B", "level": "user"},
            {"id": "follow_up", "name": "待跟进", "icon": "📌", "color": "#EF4444", "level": "user"},
            {"id": "archived", "name": "已归档", "icon": "📁", "color": "#94A3B8", "level": "user"},
        ]
    })


@app.route('/api/tags/article/<int:article_id>', methods=['GET'])
def get_article_tags(article_id):
    """获取文章的标签"""
    from tags import tag_service
    
    # TODO: 从数据库获取文章的实际标签
    # 目前返回示例数据
    return jsonify({
        "articleId": article_id,
        "tags": [
            {"id": "cat_legal", "name": "法律法规", "level": "category", "icon": "⚖️", "color": "#6366F1"},
            {"id": "ai_信用修复", "name": "信用修复", "level": "ai", "color": "#71717A"},
        ]
    })


@app.route('/api/reading-record', methods=['POST'])
@validate_json('article_id', 'device_id')
def save_reading_record():
    """保存用户阅读时间记录"""
    data = request.get_json()
    
    article_id = data.get('article_id')
    device_id = data.get('device_id')
    duration_seconds = data.get('duration_seconds', 0)
    completed = data.get('completed', False)
    
    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(f"""
                INSERT INTO reading_records (article_id, device_id, duration_seconds, completed)
                VALUES ({ph}, {ph}, {ph}, {ph})
            """, (article_id, device_id, duration_seconds, completed))
            conn.commit()
        
        return success()
    except Exception as e:
        print(f"❌ 保存阅读记录失败: {e}")
        return internal_error(str(e))


@app.route('/api/reading-stats', methods=['GET'])
def get_reading_stats():
    """获取设备的阅读统计"""
    device_id = request.args.get('device_id')
    
    if not device_id:
        return jsonify({"error": "Missing device_id"}), 400
    
    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            # 获取总阅读时长
            cur.execute(f"""
                SELECT 
                    COUNT(*) as total_articles,
                    COALESCE(SUM(duration_seconds), 0) as total_seconds,
                    COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count
                FROM reading_records
                WHERE device_id = {ph}
            """, (device_id,))
            row = cur.fetchone()
            
            # 获取每篇文章的阅读时长
            cur.execute(f"""
                SELECT article_id, SUM(duration_seconds) as total_duration
                FROM reading_records
                WHERE device_id = {ph}
                GROUP BY article_id
            """, (device_id,))
            article_times = {r[0]: r[1] for r in cur.fetchall()}
        
        return jsonify({
            "device_id": device_id,
            "total_articles": row[0] if row else 0,
            "total_seconds": row[1] if row else 0,
            "completed_count": row[2] if row else 0,
            "article_reading_times": article_times
        })
    except Exception as e:
        print(f"❌ 获取阅读统计失败: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/entities', methods=['GET'])
def get_entities():
    """获取实体雷达列表"""
    entities = entity_service.get_entities()
    result = []
    for entity in entities:
        if hasattr(entity, "model_dump"):
            result.append(entity.model_dump())
        elif hasattr(entity, "dict"):
            result.append(entity.dict())
        else:
            result.append(entity)
    return jsonify(result)


@app.route('/api/entities/toggle/<entity_id>', methods=['POST'])
def toggle_entity_subscription(entity_id: str):
    """订阅/取消订阅实体"""
    is_subscribed = entity_service.toggle_subscription(entity_id)
    return jsonify({"entity_id": entity_id, "is_subscribed": is_subscribed})


@app.route('/api/briefing/daily', methods=['GET'])
def get_daily_briefing():
    """生成每日简报（与情报卡片同源）"""
    limit = int(request.args.get('limit', 5))
    skip_ai = request.args.get('skip_ai', 'false').lower() == 'true'
    cards = build_intelligence_cards(limit=limit, skip_ai=skip_ai)
    return jsonify(build_daily_briefing(cards))


# ============ Topics / Fortress API ============

@app.route('/api/topics', methods=['GET', 'POST'])
def handle_topics():
    """堡垒主题管理"""
    if request.method == 'GET':
        return jsonify(topic_service.get_all_topics())
    elif request.method == 'POST':
        data = request.json
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        new_id = topic_service.create_topic(
            data['title'], 
            data.get('description', ''), 
            data.get('channel_key')
        )
        return jsonify({'id': new_id, 'message': 'Topic created'}), 201

@app.route('/api/topics/<int:topic_id>', methods=['GET'])
def get_topic(topic_id):
    """获取单个主题详情（含版本轴与证据链）"""
    topic = topic_service.get_topic_detail(topic_id)
    if not topic:
        return jsonify({'error': 'Topic not found'}), 404
    return jsonify(topic)

@app.route('/api/topics/<int:topic_id>/evidence', methods=['POST'])
def add_evidence(topic_id):
    """为主题添加证据砖块"""
    data = request.json
    if not data or 'note' not in data:
        return jsonify({'error': 'Note is required'}), 400
    
    eid = topic_service.add_evidence(
        topic_id,
        data['note'],
        data.get('source_title', ''),
        data.get('source_url', ''),
        data.get('highlight_text')
    )
    return jsonify({'id': eid, 'message': 'Evidence added'}), 201


# ============ 启动 ============

if __name__ == '__main__':
    # 全量初始化 (Supabase / PostgreSQL)
    from database import init_db
    init_db()
    
    print(f"✓ AI 模型: {DEFAULT_MODEL}")
    print(f"✓ AI 接口: {OPENAI_BASE_URL}")
    print(f"✓ Special 接口: {SPECIAL_API_URL}")
    print(f"\n🚀 本地调试启动: http://0.0.0.0:8000\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
else:
    # 生产环境 (Gunicorn 启动) 初始化
    from database import init_db
    init_db()
    
    # 启动时预热：检查并同步今日数据
    if os.getenv('ENABLE_STARTUP_SYNC', 'true').lower() == 'true':
        try:
            print("🔄 生产环境启动预热...")
            get_raw_articles_by_category()
            print("✅ 数据预热完成")
        except Exception as e:
            print(f"⚠️ 启动预热失败（不影响服务）: {e}")
