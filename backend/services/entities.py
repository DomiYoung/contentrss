import json
import math
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from database import db_conn, get_placeholder

# 配置日志
logger = logging.getLogger(__name__)

class EntityType(str):
    COMPANY = "company"
    INDUSTRY = "industry"
    TOPIC = "topic"

class Entity(BaseModel):
    id: str
    name: str
    type: str # company, industry, topic
    icon: Optional[str] = None
    subscriber_count: int = 0
    is_subscribed: bool = False
    dimensions: Optional[Dict[str, int]] = None  # AI 维度评分
    tags: List[str] = []  # 动态发现的标签

class EntityRadarData(BaseModel):
    name: str
    dimensions: Dict[str, int]

# 实体的订阅关系应当持久化在数据库中，此处仅为演示环境中的上下文模拟
USER_SUBSCRIPTIONS = set() # 默认清空，由用户操作触发

class EntityService:
    def __init__(self):
        # 简单缓存，避免同一周期内重复 AI 计算
        self._radar_cache = {}

    def get_entities(self) -> List[Entity]:
        """动态获取实体列表并聚合真实 AI 信号 (Sentiment/Volume)"""
        try:
            with db_conn() as conn:
                cur = conn.cursor()
                cur.execute("""
                    SELECT ai_impacts, ai_polarity, ai_opinion
                    FROM raw_articles 
                    WHERE ai_impacts IS NOT NULL 
                    ORDER BY ingested_at DESC
                    LIMIT 300
                """)
                rows = cur.fetchall()
            
            stats = {} # { name: {count, total_polarity, type_votes: {type: count}} }
            
            for row in rows:
                impacts = json.loads(row["ai_impacts"]) if isinstance(row["ai_impacts"], str) else row["ai_impacts"]
                polarity_map = {"positive": 90, "neutral": 50, "negative": 20}
                val = polarity_map.get(row.get("ai_polarity", "neutral"), 50)
                
                for imp in impacts:
                    name = imp.get("entity")
                    if not name: continue
                    
                    if name not in stats:
                        stats[name] = {"count": 0, "sum_pol": 0, "types": {}}
                    
                    s = stats[name]
                    s["count"] += 1
                    s["sum_pol"] += val
                    
                    # 类型投票
                    if "reason" in imp:
                        reason = imp["reason"].lower()
                        t = "topic"
                        if any(x in reason for x in ["公司", "集团", "品牌", "corp", "inc"]): t = "company"
                        elif any(x in reason for x in ["行业", "市场", "领域", "sector"]): t = "industry"
                        s["types"][t] = s["types"].get(t, 0) + 1
            
            # 排序并生成结果
            # Volume 定义：在该样本周期内的出现频率，归一化到 0-100
            max_mentions = max([s["count"] for s in stats.values()]) if stats else 1
            sorted_names = sorted(stats.items(), key=lambda x: x[1]["count"], reverse=True)[:15]
            
            result = []
            for name, s in sorted_names:
                avg_pol = int(s["sum_pol"] / s["count"])
                vol = int((s["count"] / max_mentions) * 100)
                # 取投票最高的类型
                e_type = max(s["types"].items(), key=lambda x: x[1])[0] if s["types"] else "topic"
                icon = "🏢" if e_type == "company" else "📊" if e_type == "industry" else "🏷️"

                result.append(Entity(
                    id=name.lower().replace(" ", "-"),
                    name=name,
                    type=e_type,
                    icon=icon,
                    subscriber_count=s["count"] * 187 + 42, # 模拟关注量级
                    is_subscribed=name.lower() in USER_SUBSCRIPTIONS,
                    dimensions={
                        "sentiment": avg_pol,
                        "volume": vol,
                        "momentum": 50,    # 固定的 5 维度中，前两个由实时聚合产生
                        "volatility": 30,  # 后三个需要深度分析，列表页先给中值
                        "scope": 50
                    },
                    tags=[e_type.upper(), "REAL-TIME"]
                ))
            return result
        except Exception as e:
            logger.error(f"获取实体列表聚合失败: {e}")
            return []

    def toggle_subscription(self, entity_id: str) -> bool:
        if entity_id in USER_SUBSCRIPTIONS:
            USER_SUBSCRIPTIONS.remove(entity_id)
            return False
        else:
            USER_SUBSCRIPTIONS.add(entity_id)
            return True

    def get_radar_data(self) -> List[Dict[str, Any]]:
        """
        AI 驱动的实体雷达数据合成
        1. 识别高频实体
        2. 聚合实体相关的摘要文字
        3. 调用 AI 进行多维评分
        """
        try:
            # 1. 获取近期数据并识别实体
            with db_conn() as conn:
                cur = conn.cursor()
                cur.execute("""
                    SELECT title, summary, ai_impacts, ai_opinion, ai_polarity, ingested_at 
                    FROM raw_articles 
                    WHERE ai_impacts IS NOT NULL 
                    ORDER BY ingested_at DESC 
                    LIMIT 100
                """)
                rows = cur.fetchall()
            
            entity_mentions: Dict[str, List[str]] = {}
            for row in rows:
                impacts = json.loads(row["ai_impacts"]) if isinstance(row["ai_impacts"], str) else row["ai_impacts"]
                for imp in impacts:
                    name = imp.get("entity")
                    if not name: continue
                    if name not in entity_mentions:
                        entity_mentions[name] = []
                    
                    # 收集上下文信息供 AI 评分
                    context = f"Title: {row['title']}. Summary: {row['summary']}. Opinion: {row.get('ai_opinion', '')}"
                    entity_mentions[name].append(context)
            
            # 2. 筛选前 5 个最值得分析的实体
            top_entities = sorted(entity_mentions.items(), key=lambda x: len(x[1]), reverse=True)[:5]
            
            radar_results = []
            for name, contexts in top_entities:
                # 检查缓存 (简化版)
                if name in self._radar_cache:
                    radar_results.append(self._radar_cache[name])
                    continue

                # 3. 调用 AI 进行专家级评分
                radar_info = self._synthesize_with_ai(name, contexts)
                if radar_info:
                    self._radar_cache[name] = radar_info
                    radar_results.append(radar_info)
            
            return radar_results
        except Exception as e:
            logger.error(f"获取雷达数据失败: {e}")
            return []

    def _synthesize_with_ai(self, entity_name: str, contexts: List[str]) -> Optional[Dict[str, Any]]:
        """调用 AI 模型进行五个维度的综合评分"""
        from main import ai_client, DEFAULT_MODEL
        
        # 准备提示词
        summary_text = "\n".join(contexts[:10]) # 限制上下文长度
        prompt = f"""
        你是一名资深行业情报分析师。请针对实体“{entity_name}”，基于以下近期情报摘要，在五个维度上给出专家评分（0-100）。
        
        【待分析内容】：
        {summary_text}
        
        【评分维度说明】：
        1. sentiment (情绪): 市场对该实体的正面/负面情绪。100代表极度乐观。
        2. volume (热度): 提及频率和讨论密度。
        3. momentum (动能): 近期趋势是爆发式增长还是衰退。
        4. volatility (波动): 情绪和态势的不确定性/波动程度。
        5. scope (覆盖): 影响的广度，是否横跨多个细分领域。
        
        【输出要求】：
        仅输出 JSON 格式，不要有任何解析或闲聊。格式如下：
        {{
            "name": "{entity_name}",
            "dimensions": {{
                "sentiment": 85,
                "volume": 70,
                "momentum": 90,
                "volatility": 30,
                "scope": 65
            }}
        }}
        """
        
        try:
            response = ai_client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": "你是一个高度专业的情报合成系统。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            # 确保数据结构正确
            if "dimensions" in result and "name" in result:
                return result
            return None
        except Exception as e:
            logger.error(f"AI 合成失败 ({entity_name}): {e}")
            return None
