"""
Tag Service - 标签服务层
单点维护所有标签相关逻辑，替代硬编码的 CATEGORY_MAPPING
"""

from typing import Dict, List, Optional, Any
from database import get_db_connection, get_placeholder, is_postgres


class TagService:
    """标签服务 - 封装所有标签操作"""
    
    _category_cache: Optional[Dict[str, Dict]] = None
    _category_id_cache: Optional[Dict[int, Dict]] = None
    
    def get_all_categories(self) -> List[Dict[str, Any]]:
        """获取所有分类标签"""
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, tag_key, name, icon, color FROM tags WHERE level = 'category' ORDER BY id"
            )
            rows = cur.fetchall()
            return [dict(row) if hasattr(row, 'keys') else {
                'id': row[0], 'tag_key': row[1], 'name': row[2], 
                'icon': row[3], 'color': row[4]
            } for row in rows]
    
    def get_tag_by_key(self, tag_key: str) -> Optional[Dict[str, Any]]:
        """根据 tag_key 获取标签详情"""
        placeholder = get_placeholder()
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, tag_key, name, icon, color FROM tags WHERE tag_key = {placeholder}",
                (tag_key,)
            )
            row = cur.fetchone()
            if row:
                return dict(row) if hasattr(row, 'keys') else {
                    'id': row[0], 'tag_key': row[1], 'name': row[2],
                    'icon': row[3], 'color': row[4]
                }
            return None
    
    def get_tag_by_id(self, tag_id: int) -> Optional[Dict[str, Any]]:
        """根据 id 获取标签详情"""
        placeholder = get_placeholder()
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                f"SELECT id, tag_key, name, icon, color FROM tags WHERE id = {placeholder}",
                (tag_id,)
            )
            row = cur.fetchone()
            if row:
                return dict(row) if hasattr(row, 'keys') else {
                    'id': row[0], 'tag_key': row[1], 'name': row[2],
                    'icon': row[3], 'color': row[4]
                }
            return None
    
    def get_category_mapping(self) -> Dict[str, str]:
        """返回 tag_key → name 映射（替代硬编码 CATEGORY_MAPPING）"""
        if self._category_cache is None:
            self._refresh_cache()
        return {k: v['name'] for k, v in (self._category_cache or {}).items()}
    
    def get_category_id_mapping(self) -> Dict[str, int]:
        """返回 tag_key → id 映射"""
        if self._category_cache is None:
            self._refresh_cache()
        return {k: v['id'] for k, v in (self._category_cache or {}).items()}
    
    def get_category_by_id(self, tag_id: int) -> Optional[Dict[str, Any]]:
        """根据 id 获取分类信息（带缓存）"""
        if self._category_id_cache is None:
            self._refresh_cache()
        return (self._category_id_cache or {}).get(tag_id)
    
    def _refresh_cache(self):
        """刷新本地缓存"""
        categories = self.get_all_categories()
        self._category_cache = {cat['tag_key']: cat for cat in categories}
        self._category_id_cache = {cat['id']: cat for cat in categories}
    
    def invalidate_cache(self):
        """清除缓存（标签更新后调用）"""
        self._category_cache = None
        self._category_id_cache = None


# 全局单例
tag_service = TagService()
