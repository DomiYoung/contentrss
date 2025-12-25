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
from database import init_db

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
PROD_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=PROD_ORIGINS)

# 分类映射
CATEGORY_MAPPING = {
    "legal": "法律法规",
    "digital": "数字化",
    "brand": "品牌",
    "rd": "新品研发",
    "global": "国际形势",
    "insight": "行业洞察",
    "ai": "AI",
    "management": "企业管理"
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
    return jsonify({"status": "ok", "model": DEFAULT_MODEL})


@app.route('/api/raw-data', methods=['GET'])
def get_raw_data():
    """获取原始公众号数据（数据中心用）"""
    category = request.args.get('category', 'legal')
    
    # 获取数据
    response = fetch_special_data()
    data = parse_special_response(response)
    
    # 按分类筛选
    items = data.get(category, [])
    
    return jsonify({
        "category": category,
        "label": CATEGORY_MAPPING.get(category, category),
        "count": len(items),
        "items": items
    })


@app.route('/api/intelligence', methods=['GET'])
def get_intelligence():
    """获取 AI 分析后的情报卡片（首页用）"""
    limit = int(request.args.get('limit', 20))
    skip_ai = request.args.get('skip_ai', 'false').lower() == 'true'
    
    # 获取数据
    response = fetch_special_data()
    data = parse_special_response(response)
    
    cards = []
    
    # 从各分类取数据
    for category_key, articles in data.items():
        if not isinstance(articles, list):
            continue
        
        for idx, article in enumerate(articles[:3]):  # 每分类最多 3 条
            fields = article.get('fields', {})
            
            # 解析文章信息
            title = fields.get('文章标题-moss用', '')
            summary = ''
            source_name = ''
            source_url = ''
            
            article_info = fields.get('文章信息', '')
            if article_info:
                try:
                    info = json.loads(article_info)
                    title = info.get('文章标题', title)
                    summary = info.get('摘要', '')
                    source_name = info.get('作者名称', '')
                    source_url = info.get('文章URL', '')
                except:
                    pass
            
            if not title:
                continue
            
            # AI 分析
            if skip_ai:
                analysis = {
                    "polarity": "neutral",
                    "impacts": [],
                    "tags": [CATEGORY_MAPPING.get(category_key, category_key)],
                    "actionable_insight": ""
                }
            else:
                analysis = analyze_article(title, summary)
                analysis['tags'] = analysis.get('tags', []) + [CATEGORY_MAPPING.get(category_key, category_key)]
            
            card = {
                "id": fields.get('自增ID', len(cards)),
                "title": title,
                "polarity": analysis.get('polarity', 'neutral'),
                "fact": analysis.get('fact', summary), # 优先使用 AI 提炼的事实
                "impacts": analysis.get('impacts', []),
                "opinion": analysis.get('opinion', ''), # 匹配 analyst_v1.md 的输出
                "tags": analysis.get('tags', []),
                "source_name": source_name,
                "source_url": source_url
            }
            
            cards.append(card)
            
            if len(cards) >= limit:
                break
        
        if len(cards) >= limit:
            break
    
    return jsonify({
        "count": len(cards),
        "cards": cards
    })


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有分类（兼容旧 API）"""
    return jsonify({
        "categories": [
            {"id": k, "label": v} for k, v in CATEGORY_MAPPING.items()
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
    # 全量初始化 (支持 SQLite 或 PostgreSQL)
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
