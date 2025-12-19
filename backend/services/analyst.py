import json
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

# --- Data Models (matching the Prompt Output) ---
class Polarity(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class Impact(BaseModel):
    entity: str
    trend: str  # "up" | "down"
    reason: str

class IntelligenceCard(BaseModel):
    id: int
    title: str
    polarity: Polarity
    fact: str
    impacts: List[Impact]
    opinion: str
    tags: List[str]
    source_url: Optional[str] = None
    source_name: Optional[str] = None

# --- Mock Data Store (Simulating LLM Output) ---
# In a real app, we would send 'content' to OpenAI and parse the JSON response.
# Here we manually mapped the raw articles to the expected output.

MOCK_DB = {
    740784: IntelligenceCard(
        id=740784,
        title="爱马仕股份离奇蒸发",
        polarity=Polarity.NEGATIVE,
        fact="爱马仕继承人皮埃什百亿股份遭理财顾问私自转移，LVMH卷入其中。",
        impacts=[
            Impact(entity="爱马仕", trend="down", reason="股权结构动荡"),
            Impact(entity="家族信托", trend="down", reason="信任危机爆发")
        ],
        opinion="这不是单纯的诈骗，是老钱家族治理结构的典型溃败。财富屏蔽了风险，也屏蔽了常识。",
        tags=["#家族办公室", "#股权争夺", "#LVMH"],
        source_name="起点财经",
        source_url="https://mp.weixin.qq.com/s?__biz=MzA3NzIxNzI4Mw==&mid=2671230032&idx=2&sn=31a0493c3e342cfa59cf455d9c33941a"
    ),
    741623: IntelligenceCard(
        id=741623,
        title="童颜针走下神坛",
        polarity=Polarity.NEUTRAL,
        fact="童颜针市场从高价垄断转向多元竞争，新氧通过低价策略倒逼厂商让出定价权。",
        impacts=[
            Impact(entity="新氧", trend="up", reason="获客成本降低"),
            Impact(entity="爱美客", trend="down", reason="护城河被破")
        ],
        opinion="医美暴利时代的终结号角。当渠道商开始因为那定价权，上游厂商的好日子就到头了。",
        tags=["#医美", "#消费医疗", "#价格战"],
        source_name="化妆品观察",
        source_url="https://mp.weixin.qq.com/s?__biz=MzkzMjQ5MDAyMw==&mid=2247629200&idx=1&sn=0373fc3f6624f0b4ecd8888e749c2a43"
    )
}

class AnalystService:
    def analyze_article(self, article_id: int):
        # Simulate LLM Processing
        return MOCK_DB.get(article_id)

    def get_feed(self):
        return list(MOCK_DB.values())
