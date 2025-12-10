from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging
from starlette.responses import Response
from starlette.types import Scope

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


class FixedStaticFiles(StaticFiles):
    """
    自定義 StaticFiles 類，修復 Windows 系統上的 MIME type 問題
    強制為 JavaScript 文件設置正確的 Content-Type
    """

    # MIME type 映射表
    MIME_TYPES = {
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
    }

    async def get_response(self, path: str, scope: Scope) -> Response:
        """覆寫 get_response 方法以設置正確的 MIME type"""
        response = await super().get_response(path, scope)

        # 獲取文件擴展名
        file_ext = Path(path).suffix.lower()

        # 如果有匹配的 MIME type，強制設置
        if file_ext in self.MIME_TYPES:
            response.headers['Content-Type'] = self.MIME_TYPES[file_ext]
            logger.debug(f"Set MIME type for {path}: {self.MIME_TYPES[file_ext]}")

        return response


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

# Mount static files directory with fixed MIME types
static_path = Path(__file__).parent / "static"
app.mount("/static", FixedStaticFiles(directory=str(static_path)), name="static")


# Root route returns frontend page
@app.get("/")
async def read_root():
    return FileResponse(str(static_path / "index.html"))


# Favicon route to prevent 404 errors
@app.get("/favicon.ico")
async def favicon():
    """返回空響應以避免 favicon 404 錯誤"""
    from fastapi import Response
    return Response(status_code=204)


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
