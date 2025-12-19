from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.analyst import AnalystService

app = FastAPI(title="ContentRSS Intelligence Engine")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyst = AnalystService()

@app.get("/")
def read_root():
    return {"status": "System Operational", "agent": "Senior Analyst"}

@app.get("/api/feed")
def get_feed():
    """
    Get the Intelligence Feed (Mock Data for now)
    """
    return analyst.get_feed()

@app.get("/api/analyze/{article_id}")
def analyze_article(article_id: int):
    """
    Force analyze a specific article
    """
    return analyst.analyze_article(article_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
