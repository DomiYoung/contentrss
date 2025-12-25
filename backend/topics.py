from database import get_db_connection, get_placeholder
from typing import List, Dict, Optional
import datetime

class TopicService:
    def execute_query(self, query: str, params: tuple = ()):
        """统一的查询助手，处理占位符和 Cursor 差异"""
        placeholder = get_placeholder()
        # 将 SQL 中的 ? 替换为当前引擎支持的占位符 (如果需要)
        # 注意：这里我们假设代码中原本写的是 ?
        final_query = query.replace('?', placeholder)
        
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(final_query, params)
            if query.strip().upper().startswith("SELECT"):
                # 如果是 SELECT，返回所有结果
                rows = cur.fetchall()
                return [dict(r) for r in rows]
            else:
                # 如果是 INSERT/UPDATE/DELETE
                conn.commit()
                # 兼容获取 lastrowid
                if hasattr(cur, 'lastrowid'):
                    return cur.lastrowid
                return None

    def get_all_topics(self) -> List[dict]:
        return self.execute_query("SELECT * FROM topics ORDER BY updated_at DESC")

    def get_topic_detail(self, topic_id: int) -> Optional[dict]:
        topics = self.execute_query("SELECT * FROM topics WHERE id = ?", (topic_id,))
        if not topics:
            return None
        
        topic = topics[0]
        # 获取关联证据
        evidences = self.execute_query(
            "SELECT * FROM topic_evidences WHERE topic_id = ? ORDER BY created_at DESC", 
            (topic_id,)
        )
        
        # 获取版本历史
        updates = self.execute_query(
            "SELECT * FROM topic_updates WHERE topic_id = ? ORDER BY created_at DESC", 
            (topic_id,)
        )
        
        topic['evidences'] = evidences
        topic['updates'] = updates
        return topic

    def create_topic(self, title: str, description: str, channel_key: str) -> int:
        return self.execute_query(
            "INSERT INTO topics (title, description, channel_key) VALUES (?, ?, ?)",
            (title, description, channel_key)
        )

    def add_evidence(self, topic_id: int, note: str, source_title: str, source_url: str, highlight_text: str = None) -> int:
        eid = self.execute_query(
            """INSERT INTO topic_evidences 
               (topic_id, note, source_title, source_url, highlight_text) 
               VALUES (?, ?, ?, ?, ?)""",
            (topic_id, note, source_title, source_url, highlight_text)
        )
        
        # Update topic updated_at
        self.execute_query(
            "UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (topic_id,)
        )
        return eid

    def create_version_update(self, topic_id: int, version: str, content: str, change_log: str) -> int:
        uid = self.execute_query(
            """INSERT INTO topic_updates 
               (topic_id, version, content, change_log) 
               VALUES (?, ?, ?, ?)""",
            (topic_id, version, content, change_log)
        )
        # Update current version in topic
        self.execute_query(
            "UPDATE topics SET current_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (version, topic_id)
        )
        return uid

topic_service = TopicService()
