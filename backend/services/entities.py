from typing import List, Optional
from pydantic import BaseModel

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
    is_subscribed: bool = False # For the current user context (Mock)

# Mock Data Store for Entities
MOCK_ENTITIES = [
    {"id": "hermes", "name": "爱马仕", "type": "company", "icon": "💼", "subscriber_count": 1240, "is_subscribed": False},
    {"id": "lvmh", "name": "LVMH", "type": "company", "icon": "💎", "subscriber_count": 3500, "is_subscribed": True},
    {"id": "luxury", "name": "奢侈品", "type": "industry", "icon": "✨", "subscriber_count": 8900, "is_subscribed": True},
    {"id": "beauty", "name": "医美", "type": "industry", "icon": "💉", "subscriber_count": 4200, "is_subscribed": False},
    {"id": "apple", "name": "Apple", "type": "company", "icon": "🍎", "subscriber_count": 15000, "is_subscribed": False},
    {"id": "ai", "name": "人工智能", "type": "topic", "icon": "🤖", "subscriber_count": 21000, "is_subscribed": True},
]

# Simple In-Memory Subscriptions (Mock)
USER_SUBSCRIPTIONS = {"lvmh", "luxury", "ai"}

class EntityService:
    def get_entities(self) -> List[Entity]:
        return [
            Entity(**{**e, "is_subscribed": e["id"] in USER_SUBSCRIPTIONS})
            for e in MOCK_ENTITIES
        ]

    def toggle_subscription(self, entity_id: str) -> bool:
        if entity_id in USER_SUBSCRIPTIONS:
            USER_SUBSCRIPTIONS.remove(entity_id)
            return False
        else:
            USER_SUBSCRIPTIONS.add(entity_id)
            return True
