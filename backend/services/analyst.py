import json
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

# --- Data Models (Strictly matching api-spec.json) ---
class Polarity(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class Impact(BaseModel):
    entity: str
    trend: str  # enum: up, down
    reason: str

class IntelligenceCard(BaseModel):
    id: int
    title: str
    polarity: Polarity
    fact: str
    impacts: List[Impact]
    opinion: Optional[str] = None
    tags: List[str]
    source_name: Optional[str] = None
    source_url: Optional[str] = None

# Feature 002: Extended Model for Detail View
class ArticleDetail(IntelligenceCard):
    content: str
    summary: str # The Brain TL;DR
    original_url: Optional[str] = None

# Feature 004: Editorial Briefing Models
class ImpactSegment(BaseModel):
    trigger: str
    path: List[str]
    conclusion: str

# Feature 005: Lenny Style Evolution Models
class FrameworkNode(BaseModel):
    label: str
    value: str

class Framework(BaseModel):
    type: str # matrix, pyramid, list
    title: str
    nodes: List[FrameworkNode]

class DailyBriefing(BaseModel):
    date: str
    title: str
    subtitle: Optional[str] = None
    read_time: str
    synthesis: str
    takeaways: List[str]
    top_picks: List[IntelligenceCard]
    impact_chain: ImpactSegment
    framework: Optional[Framework] = None

# --- Mock Data Store ---
MOCK_FEED_DATA = [
    {
        "id": 740784,
        "title": "爱马仕股份离奇蒸发",
        "polarity": "negative",
        "fact": "爱马仕继承人皮埃什百亿股份遭理财顾问私自转移，LVMH卷入其中。",
        "impacts": [
            {"entity": "爱马仕", "trend": "down", "reason": "股权结构动荡"},
            {"entity": "LVMH", "trend": "up", "reason": "意外获得战略筹码"}
        ],
        "opinion": "这不是单纯的诈骗，是老钱家族治理结构的典型溃败。",
        "tags": ["奢侈品", "LVMH"],
        "source_name": "起点财经",
        "source_url": "https://mp.weixin.qq.com/s/example1",
        "summary": json.dumps({
            "thesis": "爱马仕皮埃什家族股权离奇失踪，LVMH 或成最大赢家。",
            "facts": [
                "600万股（约5.7%）爱马仕股份被理财顾问私自转移。",
                "LVMH 被怀疑是幕后接盘方，可能重启收购战。",
                "暴露了老钱家族在财富传承中的治理漏洞。"
            ],
            "sentiment": "bearish"
        }),
        "content": """
## 核心事件
爱马仕 (Hermès) 家族继承人尼古拉斯·皮埃什 (Nicolas Puech) 近日向法院提起诉讼，声称其持有的约 600 万股爱马仕股票（约占总股本 5.7%）被其前财富管理顾问埃里克 (Eric Freymond) 私自转移。

## 深度分析
这不仅是一起简单的诈骗案，更暴露了欧洲老钱家族在财富传承中的治理漏洞。

### 1. 对 LVMH 的战略意义
如果这 5.7% 的股份确实如传言般流入了 LVMH 手中，伯纳德·阿诺特 (Bernard Arnault) 将重新获得对爱马仕的战略威慑力。虽然不足以发起全面收购，但足以在董事会制造巨大噪音。

### 2. 家族信托的信任危机
皮埃什此前曾计划将全部财产遗赠给其家政工（园丁），这一举动本身就显示了其与家族核心成员的裂痕。此次股权丢失，进一步削弱了 Dumas 家族对爱马仕的绝对控制权。

## 后续推演
- **短期**：爱马仕股价可能因股权争夺传闻而波动。
- **长期**：家族内部必然发起清洗，收回流散在外的筹码。
        """
    },
    {
        "id": 741623,
        "title": "童颜针走下神坛",
        "polarity": "neutral",
        "fact": "童颜针市场从高价垄断转向多元竞争，新氧通过低价策略倒逼厂商让出定价权。",
        "impacts": [
            {"entity": "新氧", "trend": "up", "reason": "获客成本降低"},
            {"entity": "爱美客", "trend": "down", "reason": "护城河被破"}
        ],
        "opinion": "医美暴利时代的终结号角。",
        "tags": ["医美", "消费医疗", "#价格战"],
        "source_name": "化妆品观察",
        "source_url": "https://mp.weixin.qq.com/s/example2",
        "summary": json.dumps({
            "thesis": "童颜针暴利时代终结，价格战倒逼上游厂商让利。",
            "facts": [
                "新氧低价策略击穿厂商价格体系。",
                "国产生物材料成熟，稀缺性红利消失。",
                "渠道商话语权首次超越品牌方。"
            ],
            "sentiment": "neutral"
        }),
        "content": """
## 市场变局
过去三年，爱美客的‘濡白天使’和长春圣博玛的‘艾维岚’这就是医美界的茅台，定价权完全掌握在厂商手中。
然而，随着新氧等平台推出自营/联名品牌，以及更多合规证照的下发，稀缺性被打破。

### 渠道商的反击
机构苦高价久矣。新氧通过‘优享’策略，将童颜针作为引流品，直接击穿了厂商维持的价格体系。

### 厂商的困境
当产品不再稀缺，品牌力不足的厂商将陷入价格战泥潭。唯有具备强研发能力（如开发新一代再生材料）的企业才能维持高毛利。
        """
    }
]

class AnalystService:
    def get_feed(self) -> List[IntelligenceCard]:
        from services.entities import USER_SUBSCRIPTIONS
        
        # If user has subscriptions, we prefer showing related content (Mock filtering)
        if USER_SUBSCRIPTIONS:
            # Simple heuristic: if any tag in the card matches a subscribed entity id
            filtered = [
                item for item in MOCK_FEED_DATA 
                if any(tag.lower().replace('#', '') in USER_SUBSCRIPTIONS for tag in item["tags"]) 
                or item.get("source_name") in USER_SUBSCRIPTIONS # Or source match
            ]
            if filtered:
                return [IntelligenceCard(**item) for item in filtered]
        
        # Fallback to all feed items
        return [IntelligenceCard(**item) for item in MOCK_FEED_DATA]

    def analyze_article(self, article_id: int) -> Optional[ArticleDetail]:
        item = next((x for x in MOCK_FEED_DATA if x["id"] == article_id), None)
        if item:
            return ArticleDetail(**item)
        return None

    def get_daily_briefing(self) -> DailyBriefing:
        # Mocking a Lenny-style elite briefing
        return DailyBriefing(
            date="2025-12-23",
            title="The Luxury Tech Convergence",
            subtitle="How Hermès' inheritance crisis and AI medical breakthroughs are redefining 'defensive' assets.",
            read_time="6 min read",
            synthesis=(
                "Last week, the market focused on technical indicators. This week, we are seeing the return of 'Foundational Ris'. "
                "The Hermès inheritance saga is a masterclass in how generational wealth انتقال (transfer) can create structural openings for predators like LVMH. "
                "Simultaneously, the AI Biotech track has reached a 'Platform Maturity' milestone. Pricing power is no longer with the manufacturers of hardware, but with the architects of the inference layer.\n\n"
                "In today's edition, we explore why these two seemingly disparate events are actually part of the same shift: The digitization of 'Old World' defensive moats."
            ),
            takeaways=[
                "Inheritance risk is the new 'Key Man' risk for LVMH competitors.",
                "AI Medical platforms are capturing the value that used to sit with equipment providers.",
                "The 'Old Money' moat is being digitized through AIGC intellectual property."
            ],
            top_picks=[IntelligenceCard(**item) for item in MOCK_FEED_DATA],
            impact_chain=ImpactSegment(
                trigger="Hermès Inheritance Crisis",
                path=[
                    "6M shares 'vanish' into the market",
                    "LVMH gains strategic entry point",
                    "Defensive moats weaken as family control dilutes"
                ],
                conclusion="M&A volatility is no longer seasonal; it's existential for European conglomerates."
            ),
            framework=Framework(
                type="matrix",
                title="Asset Stability vs. Tech Leverage",
                nodes=[
                    FrameworkNode(label="Old Luxury", value="High Stability / Low Tech"),
                    FrameworkNode(label="AI Bio-Tech", value="Medium Stability / High Tech"),
                    FrameworkNode(label="Consumer Tech", value="Low Stability / High Tech")
                ]
            )
        )
