from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.analyst import AnalystService, IntelligenceCard, ArticleDetail, DailyBriefing
from services.entities import EntityService, Entity
from typing import List

app = FastAPI(title="Industry Intelligence API", version="1.1.0")

# CORS (Allow Frontend Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyst = AnalystService()
entities = EntityService()

@app.get("/api/entities", response_model=List[Entity])
def get_entities():
    """
    Get all trackable entities
    """
    return entities.get_entities()

@app.post("/api/entities/toggle/{entity_id}")
def toggle_subscription(entity_id: str):
    """
    Toggle subscription state for an entity
    """
    is_subscribed = entities.toggle_subscription(entity_id)
    return {"entity_id": entity_id, "is_subscribed": is_subscribed}

@app.get("/api/feed", response_model=List[IntelligenceCard])
def get_feed():
    """
    Get Intelligence Feed
    """
    return analyst.get_feed()

@app.get("/api/briefing/daily", response_model=DailyBriefing)
def get_daily_briefing():
    """
    Get the editorial daily briefing
    """
    return analyst.get_daily_briefing()

@app.get("/api/article/{article_id}", response_model=ArticleDetail)
def get_article(article_id: int):
    """
    Get full Article Detail with Content and Summary
    """
    result = analyst.analyze_article(article_id)
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    return result

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
