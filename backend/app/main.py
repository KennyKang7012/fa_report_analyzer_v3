from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from .database import init_db
from . import models  # Import models to register them with Base

app = FastAPI(
    title="FA Report Analyzer API",
    description="Failure Analysis Report Evaluation Web Application",
    version="3.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


# Root route returns frontend page
@app.get("/")
async def read_root():
    return FileResponse(str(static_path / "index.html"))


# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
