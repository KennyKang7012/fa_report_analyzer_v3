from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging

from .database import init_db
from . import models  # Import models to register them with Base

# Import API routers
from .api import upload, analyze, result, config, history

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FA Report Analyzer API",
    description="Failure Analysis Report Evaluation Web Application",
    version="3.0.0",
    docs_url="/docs",
    redoc_url=None  # We'll create custom ReDoc route
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("正在初始化資料庫...")
    init_db()
    logger.info("資料庫初始化完成")
    logger.info("FA Report Analyzer v3.0 API 已啟動")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(result.router)
app.include_router(config.router)
app.include_router(history.router)

logger.info("已註冊 API 路由: upload, analyze, result, config, history")

# Mount static files directory
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


# Root route returns frontend page
@app.get("/")
async def read_root():
    return FileResponse(str(static_path / "index.html"))


# Custom ReDoc route with working CDN
@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    """自定義 ReDoc 文檔頁面"""
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html>
    <head>
        <title>FA Report Analyzer API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <redoc spec-url="/openapi.json"></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
    </body>
    </html>
    """)


# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """健康檢查端點"""
    return {
        "status": "healthy",
        "version": "3.0.0",
        "message": "FA Report Analyzer API is running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
