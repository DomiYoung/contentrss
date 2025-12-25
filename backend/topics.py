from database import get_db_connection
from typing import List, Dict, Optional
import datetime

class TopicService:
    def get_all_topics(self) -> List[dict]:
        with get_db_connection() as conn:
            topics = conn.execute("SELECT * FROM topics ORDER BY updated_at DESC").fetchall()
            return [dict(t) for t in topics]

    def get_topic_detail(self, topic_id: int) -> Optional[dict]:
        with get_db_connection() as conn:
            topic = conn.execute("SELECT * FROM topics WHERE id = ?", (topic_id,)).fetchone()
            if not topic:
                return None
            
            # 获取关联证据
            evidences = conn.execute(
                "SELECT * FROM topic_evidences WHERE topic_id = ? ORDER BY created_at DESC", 
                (topic_id,)
            ).fetchall()
            
            # 获取版本历史
            updates = conn.execute(
                "SELECT * FROM topic_updates WHERE topic_id = ? ORDER BY created_at DESC", 
                (topic_id,)
            ).fetchall()
            
            result = dict(topic)
            result['evidences'] = [dict(e) for e in evidences]
            result['updates'] = [dict(u) for u in updates]
            return result

    def create_topic(self, title: str, description: str, channel_key: str) -> int:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO topics (title, description, channel_key) VALUES (?, ?, ?)",
                (title, description, channel_key)
            )
            conn.commit()
            return cursor.lastrowid

    def add_evidence(self, topic_id: int, note: str, source_title: str, source_url: str, highlight_text: str = None) -> int:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """INSERT INTO topic_evidences 
                   (topic_id, note, source_title, source_url, highlight_text) 
                   VALUES (?, ?, ?, ?, ?)""",
                (topic_id, note, source_title, source_url, highlight_text)
            )
            conn.commit()
            
            # Update topic updated_at
            conn.execute(
                "UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (topic_id,)
            )
            conn.commit()
            return cursor.lastrowid

    def create_version_update(self, topic_id: int, version: str, content: str, change_log: str) -> int:
        with get_db_connection() as conn:
            cursor = conn.execute(
                """INSERT INTO topic_updates 
                   (topic_id, version, content, change_log) 
                   VALUES (?, ?, ?, ?)""",
                (topic_id, version, content, change_log)
            )
            # Update current version in topic
            conn.execute(
                "UPDATE topics SET current_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (version, topic_id)
            )
            conn.commit()
            return cursor.lastrowid

topic_service = TopicService()
