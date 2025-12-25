"""
ContentRSS 统一标签系统
一处定义，全局同步
"""

from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class TagLevel(Enum):
    """标签层级"""
    CATEGORY = "category"  # 一级分类（8 个固定分类）
    AI = "ai"              # AI 生成标签
    USER = "user"          # 用户自定义


@dataclass
class Tag:
    """标签数据结构"""
    id: str
    name: str                        # 中文名称
    key: str                         # 后端 key
    level: TagLevel                  # 层级
    icon: Optional[str] = None       # Emoji 图标
    color: Optional[str] = None      # 颜色
    usage_count: int = 0             # 使用次数
    synced_platforms: List[str] = field(default_factory=list)  # 已同步平台
    created_at: datetime = field(default_factory=datetime.now)


# ============ 核心分类定义（8 个固定分类）============

CATEGORY_TAGS: List[Tag] = [
    Tag(id="cat_legal", name="法律法规", key="legal", level=TagLevel.CATEGORY, icon="⚖️", color="#6366F1"),
    Tag(id="cat_digital", name="数字化", key="digital", level=TagLevel.CATEGORY, icon="💻", color="#0EA5E9"),
    Tag(id="cat_brand", name="品牌", key="brand", level=TagLevel.CATEGORY, icon="💎", color="#EC4899"),
    Tag(id="cat_rd", name="新品研发", key="rd", level=TagLevel.CATEGORY, icon="🧪", color="#8B5CF6"),
    Tag(id="cat_global", name="国际形势", key="global", level=TagLevel.CATEGORY, icon="🌍", color="#14B8A6"),
    Tag(id="cat_insight", name="行业洞察", key="insight", level=TagLevel.CATEGORY, icon="📊", color="#F59E0B"),
    Tag(id="cat_ai", name="AI", key="ai", level=TagLevel.CATEGORY, icon="🤖", color="#10B981"),
    Tag(id="cat_management", name="企业管理", key="management", level=TagLevel.CATEGORY, icon="📋", color="#64748B"),
]

# Key → Tag 映射（快速查找）
CATEGORY_MAP = {tag.key: tag for tag in CATEGORY_TAGS}


class TagService:
    """标签服务"""
    
    def __init__(self):
        self.custom_tags: List[Tag] = []
        self.ai_tags: List[Tag] = []
    
    def get_category_by_key(self, key: str) -> Optional[Tag]:
        """根据 key 获取分类标签"""
        return CATEGORY_MAP.get(key)
    
    def get_all_categories(self) -> List[Tag]:
        """获取所有分类"""
        return CATEGORY_TAGS
    
    def create_ai_tag(self, name: str, source_article_id: Optional[int] = None) -> Tag:
        """创建 AI 生成的标签"""
        tag = Tag(
            id=f"ai_{name}_{datetime.now().timestamp()}",
            name=name,
            key=name.lower().replace(" ", "_"),
            level=TagLevel.AI,
            color="#71717A"
        )
        self.ai_tags.append(tag)
        return tag
    
    def create_user_tag(self, name: str, icon: Optional[str] = None, color: Optional[str] = None) -> Tag:
        """创建用户自定义标签"""
        tag = Tag(
            id=f"user_{name}_{datetime.now().timestamp()}",
            name=name,
            key=name.lower().replace(" ", "_"),
            level=TagLevel.USER,
            icon=icon or "🏷️",
            color=color or "#94A3B8"
        )
        self.custom_tags.append(tag)
        return tag
    
    def get_tags_for_article(self, category_key: str, ai_tags: List[str]) -> List[Tag]:
        """获取文章的完整标签列表"""
        tags = []
        
        # 添加分类标签
        cat_tag = self.get_category_by_key(category_key)
        if cat_tag:
            tags.append(cat_tag)
        
        # 添加 AI 标签
        for tag_name in ai_tags:
            existing = next((t for t in self.ai_tags if t.name == tag_name), None)
            if existing:
                tags.append(existing)
            else:
                tags.append(self.create_ai_tag(tag_name))
        
        return tags
    
    def to_dict(self, tag: Tag) -> dict:
        """转换为字典（API 响应）"""
        return {
            "id": tag.id,
            "name": tag.name,
            "key": tag.key,
            "level": tag.level.value,
            "icon": tag.icon,
            "color": tag.color,
            "usageCount": tag.usage_count
        }


# 单例服务
tag_service = TagService()
