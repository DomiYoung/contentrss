from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class ChannelType(Enum):
    VERTICAL = "vertical"  # 垂类频道
    THEME = "theme"        # 主题频道
    USER = "user"          # 用户自定义频道

@dataclass
class Channel:
    id: str
    name: str
    description: str
    icon: str
    type: ChannelType
    tags: List[str]  # 关联的一级分类标签
    expert_kb: Dict[str, str] = field(default_factory=dict) # 行业专家知识库 (Key-Value)
    source_rules: List[str] = field(default_factory=list) # 数据源过滤规则
    prompt_template: Optional[str] = None # 洗稿/分析专用 Prompt 模板

class ChannelService:
    def __init__(self):
        # 预置频道：美妆、AI、金融
        self.channels = {
            "beauty_alpha": Channel(
                id="beauty_alpha",
                name="美妆 Alpha",
                description="深度拆解美妆供应链、成分与大模型营销",
                icon="💎",
                type=ChannelType.VERTICAL,
                tags=["brand", "rd", "insight"],
                expert_kb={
                    "玻色因": "欧莱雅核心成分，专利期后供应链成本已大幅下降，国产替代空间巨大。",
                    "线上渠道": "抖音带货佣金通常在 20%-35%，加上坑位费，品牌毛利至少需维持在 70% 以上才有盈利空间。",
                    "选品逻辑": "头部主播如李佳琦更倾向于具有‘强功效数据’或‘独特故事线’的新锐品牌。"
                },
                source_rules=["WeChat_Pub:美妆观察", "News:化妆品报"],
                prompt_template="你是一名美妆行业资深分析师。请结合以下情报及【专家知识库】，拆解其对品牌毛利、供应链或竞争格局的二级影响。"
            ),
            "tech_edge": Channel(
                id="tech_edge",
                name="AI 趋势",
                description="捕捉全球 AI 技术突破与商业化落地点",
                icon="🤖",
                type=ChannelType.VERTICAL,
                tags=["ai", "digital"],
                expert_kb={
                    "Token Cost": "随着 Llama 3/Gemini 1.5 普及，推理成本正在按季度 30% 速度下降，SaaS 端的利润空间正在释放。",
                    "OpenSource": "开源模型正在缩小与闭源模型的差距，企业级应用更倾向于本地化微调。"
                },
                source_rules=["Twitter:AI_Leaks", "GitHub:Trending"],
                prompt_template="你是一名硅谷科技投资人。请从‘商业化变现’和‘技术护城河’两个维度分析这条情报。"
            )
        }

    def get_all_channels(self) -> List[dict]:
        return [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "icon": c.icon,
                "type": c.type.value,
                "tags": c.tags
            } for c in self.channels.values()
        ]

    def get_channel_by_id(self, channel_id: str) -> Optional[Channel]:
        return self.channels.get(channel_id)

channel_service = ChannelService()
