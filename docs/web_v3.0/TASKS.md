# FA Report Analyzer v3.0 - 詳細任務清單
## Task Breakdown (純前端架構版)

**版本**: v3.0
**文件日期**: 2025-12-01
**架構**: FastAPI + HTML/CSS/JavaScript

---

## 任務追蹤說明

**優先級**:
- **P0**: 必須完成（MVP 核心功能）
- **P1**: 應該完成（重要但非關鍵）
- **P2**: 可以完成（Nice to have）

**狀態**:
- ⬜ 未開始
- 🔄 進行中
- ✅ 已完成
- ⏸️ 暫停
- ❌ 已取消

---

## Phase 1: 後端基礎架構 (Week 1) ✅ 已完成

**完成日期**: 2025-12-03
**測試狀態**: ✅ 已通過手動測試

### 1.1 專案初始化 (1 天) ✅

#### Task 1.1.1: 創建專案結構
**優先級**: P0 | **狀態**: ✅ | **預估**: 1 小時 | **實際**: 0.5 小時

**描述**: 創建後端專案目錄結構，包含靜態文件目錄

**步驟**:
```bash
mkdir -p fa_report_analyzer_v3/backend/app/{models,schemas,api,services,core,static/{css,js,assets}}
cd fa_report_analyzer_v3/backend
touch app/__init__.py app/{main.py,config.py,database.py}
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/api/__init__.py
touch app/services/__init__.py
touch app/core/__init__.py
```

**驗收標準**:
- [x] 目錄結構正確
- [x] 所有 `__init__.py` 文件已創建
- [x] 靜態文件目錄存在

**依賴**: 無

---

#### Task 1.1.2: 安裝 FastAPI 依賴
**優先級**: P0 | **狀態**: ✅ | **預估**: 1 小時 | **實際**: 1 小時

**描述**: 創建 `requirements.txt` 並安裝依賴

**requirements.txt**:
```txt
# Web 框架
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# 資料庫
sqlalchemy==2.0.23

# v2.0 分析器依賴
anthropic==0.7.7
pandas==2.1.3
PyPDF2==3.0.1
python-docx==1.1.0
python-pptx==0.6.23
PyMuPDF==1.23.7
Pillow==10.1.0

# 可選 LLM 後端
ollama==0.1.6
openai==1.3.7

# 安全與加密
cryptography==41.0.7
python-dotenv==1.0.0

# 測試
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

**步驟**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**驗收標準**:
- [x] 虛擬環境創建成功
- [x] 所有依賴安裝無錯誤
- [x] 可以 `import fastapi`

**依賴**: Task 1.1.1

---

#### Task 1.1.3: 建立 FastAPI 應用（含靜態文件服務）
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 1.5 小時

**描述**: 創建 FastAPI 應用，配置靜態文件服務和 CORS

**檔案**: `app/main.py`

**程式碼**:
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI(
    title="FA Report Analyzer API",
    description="失效分析報告評估 Web 應用",
    version="3.0.0"
)

# CORS 設定（如果需要）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載靜態文件目錄
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# 根路由返回前端頁面
@app.get("/")
async def read_root():
    return FileResponse(str(static_path / "index.html"))

# 健康檢查
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**檔案**: `app/config.py`
```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./fa_analyzer.db"
    ENCRYPTION_KEY: Optional[str] = None
    UPLOAD_DIR: str = "uploads"
    RESULT_DIR: str = "results"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"

settings = Settings()
```

**驗收標準**:
- [x] 可以啟動服務: `uvicorn app.main:app --reload`
- [x] 訪問 `http://localhost:8000/api/v1/health` 返回正確 JSON
- [x] 訪問 `http://localhost:8000/docs` 可看到 Swagger 文件
- [x] `/static` 路徑可訪問（先創建測試文件）

**依賴**: Task 1.1.2

---

#### Task 1.1.4: 配置資料庫
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 1 小時

**描述**: 設定 SQLAlchemy 資料庫連接

**檔案**: `app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """資料庫依賴注入"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """初始化資料庫表"""
    Base.metadata.create_all(bind=engine)
```

**驗收標準**:
- [x] 資料庫連接正常
- [x] 可以創建 session
- [x] SQLite 文件生成

**依賴**: Task 1.1.3

---

### 1.2 整合 v2.0 核心邏輯 (2 天) ✅

#### Task 1.2.1: 重構 v2.0 為模組
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 0.5 小時

**描述**: 將 `fa_report_analyzer_v2.py` 複製並改造為可導入模組

**步驟**:
1. 複製文件: `cp ../../fa_report_analyzer_v2.py app/core/fa_analyzer_core.py`
2. 確保 `FAReportAnalyzer` 類可獨立使用
3. 測試導入: `from app.core.fa_analyzer_core import FAReportAnalyzer`

**驗收標準**:
- [x] 可以成功導入類
- [x] 原有功能不變
- [x] 無導入錯誤

**依賴**: Task 1.1.4

---

#### Task 1.2.2: 創建異步分析服務
**優先級**: P0 | **狀態**: ✅ | **預估**: 4 小時 | **實際**: 2 小時

**描述**: 包裝同步分析器為異步服務

**檔案**: `app/services/analyzer.py`

```python
import asyncio
from typing import Callable, Optional, Dict
from ..core.fa_analyzer_core import FAReportAnalyzer

class FAReportAnalyzerService:
    """異步 FA 報告分析服務"""

    def __init__(self):
        self.analyzer: Optional[FAReportAnalyzer] = None

    async def analyze_report(
        self,
        file_path: str,
        backend: str = "ollama",
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        skip_images: bool = False,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Dict:
        """異步執行報告分析"""
        loop = asyncio.get_event_loop()

        def run_sync():
            # 創建分析器
            self.analyzer = FAReportAnalyzer(
                backend=backend,
                model=model,
                api_key=api_key,
                skip_images=skip_images
            )

            # 進度回調
            if progress_callback:
                progress_callback(10, "正在讀取報告...")

            # 讀取報告
            report_content, images = self.analyzer.read_report(file_path)

            if progress_callback:
                progress_callback(30, "開始 AI 分析...")

            # 分析
            result = self.analyzer.analyze_with_ai(report_content, images)

            if progress_callback:
                progress_callback(100, "分析完成")

            return result

        return await loop.run_in_executor(None, run_sync)
```

**驗收標準**:
- [x] 可以異步調用分析
- [x] 進度回調正常
- [x] 不阻塞事件循環

**依賴**: Task 1.2.1

---

#### Task 1.2.3: 實現任務管理器
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 1.5 小時

**描述**: 創建任務狀態管理工具

**檔案**: `app/services/task_manager.py`

```python
from sqlalchemy.orm import Session
from ..models.task import AnalysisTask, TaskStatus
from datetime import datetime

class TaskManager:
    """任務管理器"""

    @staticmethod
    def update_progress(db: Session, task_id: str, progress: int, message: str = ""):
        """更新任務進度"""
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.progress = progress
            task.message = message
            db.commit()

    @staticmethod
    def mark_completed(db: Session, task_id: str, result: dict):
        """標記任務完成"""
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.COMPLETED.value
            task.progress = 100
            task.result = result
            task.completed_at = datetime.now()
            db.commit()

    @staticmethod
    def mark_failed(db: Session, task_id: str, error: str):
        """標記任務失敗"""
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.FAILED.value
            task.error = error
            db.commit()
```

**驗收標準**:
- [x] 可以更新進度
- [x] 可以標記完成/失敗
- [x] 資料庫更新正確

**依賴**: Task 1.3.1

---

### 1.3 資料庫模型設計 (1 天) ✅

#### Task 1.3.1: 設計資料庫模型
**優先級**: P0 | **狀態**: ✅ | **預估**: 3 小時 | **實際**: 2 小時

**描述**: 創建 SQLAlchemy 模型

**檔案**: `app/models/task.py`

```python
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum

class TaskStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AnalysisTask(Base):
    __tablename__ = "analysis_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    status = Column(String, default=TaskStatus.PENDING.value)
    progress = Column(Integer, default=0)
    message = Column(String, default="")

    backend = Column(String, nullable=False)
    model = Column(String, nullable=False)
    skip_images = Column(Integer, default=0)

    result = Column(JSON, nullable=True)
    error = Column(String, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "task_id": self.id,
            "filename": self.filename,
            "status": self.status,
            "progress": self.progress,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error": self.error
        }
```

**檔案**: `app/models/config.py`

```python
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from ..database import Base

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

**步驟**:
1. 創建模型文件
2. 在 `app/main.py` 啟動時調用 `init_db()`
3. 測試資料庫表創建

**驗收標準**:
- [x] 資料庫表成功創建
- [x] 可以進行 CRUD 操作
- [x] `to_dict()` 正常工作

**依賴**: Task 1.1.4

---

#### Task 1.3.2: 創建 Pydantic Schemas
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 1.5 小時

**描述**: 定義 API 請求/響應模型

**檔案**: `app/schemas/task.py`, `result.py`, `config.py`

```python
# app/schemas/task.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnalysisTaskCreate(BaseModel):
    file_id: str
    backend: str = "ollama"
    model: Optional[str] = None
    api_key: Optional[str] = None
    skip_images: bool = False

class AnalysisTaskResponse(BaseModel):
    task_id: str
    filename: str
    status: str
    progress: int
    message: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True
```

**驗收標準**:
- [x] 所有 schemas 定義完整
- [x] 類型驗證正常
- [x] 可以序列化/反序列化

**依賴**: Task 1.3.1

---

**Phase 1 總結**:
- ✅ 所有 P0 任務已完成 (8/8)
- ✅ 總預估時間: 20 小時
- ✅ 實際時間: ~12 小時
- ✅ 效率: 提前完成 40%
- ✅ 測試狀態: 已通過手動測試
- 📄 完成報告: 請參閱 `PHASE1_COMPLETION_REPORT.md`

---

## Phase 2: 核心 API 開發 (Week 2) ✅ 已完成

**完成日期**: 2025-12-03
**UAT 測試**: ✅ 已通過
**測試狀態**: 100% 通過 (8/8 核心功能)

### 2.1 文件上傳 API (1 天) ✅

#### Task 2.1.1: 實現文件上傳端點
**優先級**: P0 | **狀態**: ✅ | **預估**: 3 小時 | **實際**: 2 小時

**描述**: 實現 `/api/v1/upload` POST 端點

**檔案**: `app/api/upload.py`

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["upload"])

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".webp"}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上傳 FA 報告文件"""

    # 驗證文件類型
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"不支援的文件格式: {file_ext}")

    # 讀取並驗證大小
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(413, f"文件過大，最大 {settings.MAX_FILE_SIZE // (1024*1024)}MB")

    # 保存文件
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "file_id": file_id,
        "filename": file.filename,
        "size": len(content),
        "path": str(file_path)
    }
```

**在 `main.py` 中註冊路由**:
```python
from .api import upload
app.include_router(upload.router)
```

**驗收標準**:
- [x] 可上傳支援格式文件
- [x] 拒絕不支援格式
- [x] 拒絕超大文件
- [x] 返回文件 ID

**依賴**: Task 1.1.3

---

### 2.2 分析任務 API (2 天) ✅

#### Task 2.2.1: 實現分析任務端點
**優先級**: P0 | **狀態**: ✅ | **預估**: 4 小時 | **實際**: 3 小時

**描述**: 實現分析任務 CRUD API

**檔案**: `app/api/analyze.py`

```python
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.task import AnalysisTask, TaskStatus
from ..schemas.task import AnalysisTaskCreate, AnalysisTaskResponse
from ..services.analyzer import FAReportAnalyzerService
from ..services.task_manager import TaskManager
from pathlib import Path

router = APIRouter(prefix="/api/v1", tags=["analyze"])

async def run_analysis_background(task_id: str, file_path: str, config: dict):
    """後台分析任務"""
    from ..database import SessionLocal
    db = SessionLocal()

    try:
        analyzer = FAReportAnalyzerService()

        def progress_callback(progress: int, message: str):
            TaskManager.update_progress(db, task_id, progress, message)

        result = await analyzer.analyze_report(
            file_path=file_path,
            backend=config["backend"],
            model=config.get("model"),
            api_key=config.get("api_key"),
            skip_images=config.get("skip_images", False),
            progress_callback=progress_callback
        )

        TaskManager.mark_completed(db, task_id, result)

    except Exception as e:
        TaskManager.mark_failed(db, task_id, str(e))
    finally:
        db.close()

@router.post("/analyze", response_model=AnalysisTaskResponse)
async def create_analysis_task(
    request: AnalysisTaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """開始分析任務"""

    # 查找文件
    upload_dir = Path("uploads")
    matching_files = list(upload_dir.glob(f"{request.file_id}.*"))

    if not matching_files:
        raise HTTPException(404, "文件不存在")

    file_path = str(matching_files[0])

    # 創建任務
    task = AnalysisTask(
        filename=Path(file_path).name,
        file_path=file_path,
        backend=request.backend,
        model=request.model or "auto",
        skip_images=1 if request.skip_images else 0
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # 啟動後台任務
    background_tasks.add_task(
        run_analysis_background,
        task.id,
        file_path,
        {
            "backend": request.backend,
            "model": request.model,
            "api_key": request.api_key,
            "skip_images": request.skip_images
        }
    )

    return task.to_dict()

@router.get("/analyze/{task_id}", response_model=AnalysisTaskResponse)
async def get_analysis_status(task_id: str, db: Session = Depends(get_db)):
    """查詢分析狀態"""
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
    if not task:
        raise HTTPException(404, "任務不存在")
    return task.to_dict()
```

**驗收標準**:
- [x] POST 返回任務 ID
- [x] 後台任務執行
- [x] GET 返回正確狀態

**依賴**: Task 1.2.2, Task 2.1.1

---

### 2.3 結果查詢 API (1 天) ✅

#### Task 2.3.1: 實現結果端點
**優先級**: P0 | **狀態**: ✅ | **預估**: 3 小時 | **實際**: 2.5 小時

**描述**: 實現結果查詢與下載

**檔案**: `app/api/result.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.task import AnalysisTask, TaskStatus
import json

router = APIRouter(prefix="/api/v1", tags=["result"])

@router.get("/result/{task_id}")
async def get_analysis_result(task_id: str, db: Session = Depends(get_db)):
    """獲取分析結果"""
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(404, "任務不存在")

    if task.status != TaskStatus.COMPLETED.value:
        raise HTTPException(400, f"任務尚未完成，當前狀態: {task.status}")

    return {"task_id": task.id, **task.result}

@router.get("/result/{task_id}/download")
async def download_result(task_id: str, format: str = "txt", db: Session = Depends(get_db)):
    """下載分析報告"""
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task or task.status != TaskStatus.COMPLETED.value:
        raise HTTPException(404, "結果不存在")

    if format == "json":
        content = json.dumps(task.result, ensure_ascii=False, indent=2)
        media_type = "application/json"
        filename = f"fa_report_{task_id}.json"

    elif format == "txt":
        from ..core.fa_analyzer_core import FAReportAnalyzer
        analyzer = FAReportAnalyzer()
        content = analyzer.generate_report(task.result, source_file=task.filename)
        media_type = "text/plain"
        filename = f"fa_report_{task_id}.txt"

    else:
        raise HTTPException(400, "不支援的格式")

    return Response(
        content=content.encode("utf-8"),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

**驗收標準**:
- [x] 可獲取 JSON 結果
- [x] 可下載 TXT/JSON
- [x] 編碼正確

**依賴**: Task 2.2.1

---

### 2.4 配置與歷史 API (1 天) ✅

#### Task 2.4.1: 實現配置 API
**優先級**: P0 | **狀態**: ✅ | **預估**: 2 小時 | **實際**: 2.5 小時

**檔案**: `app/api/config.py`

**驗收標準**:
- [x] 可保存/讀取配置
- [x] API Key 加密

**依賴**: Task 1.3.1

---

#### Task 2.4.2: 實現歷史記錄 API
**優先級**: P1 | **狀態**: ✅ | **預估**: 3 小時 | **實際**: 2.5 小時

**檔案**: `app/api/history.py`

**驗收標準**:
- [x] 可獲取歷史列表
- [x] 可搜尋篩選
- [x] 可刪除記錄

**依賴**: Task 1.3.1

---

**Phase 2 總結**:
- ✅ 所有 P0 任務已完成 (5/5)
- ✅ 總預估時間: 15 小時
- ✅ 實際時間: ~12.5 小時
- ✅ 效率: 提前完成 17%
- ✅ UAT 測試: 100% 通過 (8/8 核心功能)
- ✅ 用戶驗收: 已通過,無發現問題
- 📄 完成報告: 請參閱 `PHASE2_COMPLETION_REPORT.md`
- 📄 測試指南: 請參閱 `PHASE2_TESTING_GUIDE.md`

---

## Phase 3: 前端開發 (Week 3)

### 3.1 基礎頁面結構 (1 天)

#### Task 3.1.1: 創建 HTML 主頁面
**優先級**: P0 | **狀態**: ⬜ | **預估**: 3 小時

**描述**: 創建單頁應用 HTML 結構

**檔案**: `app/static/index.html`

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FA Report Analyzer v3.0</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">

    <!-- 自定義樣式 -->
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <!-- 導航欄 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#home">
                <i class="bi bi-clipboard-data"></i> FA Report Analyzer
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="#home">
                            <i class="bi bi-house"></i> 首頁
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#history">
                            <i class="bi bi-clock-history"></i> 歷史記錄
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#settings">
                            <i class="bi bi-gear"></i> 設定
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- 主內容 -->
    <div class="container mt-4">
        <!-- 上傳頁面 -->
        <div id="page-upload" class="page">
            <div class="row">
                <div class="col-12">
                    <h2>上傳 FA 報告</h2>
                    <div id="upload-section">
                        <!-- 上傳表單內容（後續任務） -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 分析進度頁面 -->
        <div id="page-analysis" class="page" style="display:none;">
            <!-- 進度內容（後續任務） -->
        </div>

        <!-- 結果頁面 -->
        <div id="page-result" class="page" style="display:none;">
            <!-- 結果內容（後續任務） -->
        </div>

        <!-- 歷史記錄頁面 -->
        <div id="page-history" class="page" style="display:none;">
            <!-- 歷史內容（後續任務） -->
        </div>

        <!-- 設定頁面 -->
        <div id="page-settings" class="page" style="display:none;">
            <!-- 設定內容（後續任務） -->
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- ECharts -->
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>

    <!-- 應用 JS -->
    <script type="module" src="/static/js/app.js"></script>
</body>
</html>
```

**驗收標準**:
- [ ] HTML 結構正確
- [ ] Bootstrap 載入成功
- [ ] 導航欄可顯示

**依賴**: Task 1.1.3

---

#### Task 3.1.2: 創建基礎 CSS
**優先級**: P0 | **狀態**: ⬜ | **預估**: 1 小時

**檔案**: `app/static/css/style.css`

```css
/* 通用樣式 */
body {
    font-family: 'Microsoft YaHei', 'PingFang TC', sans-serif;
}

.page {
    min-height: 500px;
}

/* 拖拽上傳區域 */
#drop-area {
    border: 3px dashed #ccc;
    border-radius: 10px;
    padding: 50px;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
}

#drop-area.highlight {
    background-color: #e3f2fd;
    border-color: #2196f3;
}

#drop-area i {
    font-size: 4rem;
    color: #2196f3;
}

/* 等級徽章顏色 */
.grade-A { background-color: #4caf50; color: white; }
.grade-B { background-color: #2196f3; color: white; }
.grade-C { background-color: #ffc107; color: black; }
.grade-D { background-color: #ff9800; color: white; }
.grade-F { background-color: #f44336; color: white; }

/* 總分卡片 */
.score-card {
    text-align: center;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.score-card .score {
    font-size: 4rem;
    font-weight: bold;
}
```

**驗收標準**:
- [ ] CSS 載入正常
- [ ] 樣式應用正確

**依賴**: Task 3.1.1

---

#### Task 3.1.3: 創建路由管理 JS
**優先級**: P0 | **狀態**: ⬜ | **預估**: 2 小時

**檔案**: `app/static/js/app.js`

```javascript
// 簡單的 SPA 路由系統
class Router {
    constructor() {
        this.routes = {};
        this.currentPage = null;
    }

    register(path, pageId, initFn) {
        this.routes[path] = { pageId, initFn };
    }

    navigate(path, params = {}) {
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        // 更新導航欄active狀態
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`a[href="#${path}"]`)?.classList.add('active');

        // 顯示目標頁面
        const route = this.routes[path];
        if (route) {
            const pageElement = document.getElementById(route.pageId);
            pageElement.style.display = 'block';

            // 執行初始化
            if (route.initFn) {
                route.initFn(params);
            }

            this.currentPage = path;
        }
    }
}

// 全局 router 實例
const router = new Router();

// 頁面載入完成
document.addEventListener('DOMContentLoaded', () => {
    // 註冊路由
    router.register('home', 'page-upload', initUploadPage);
    router.register('analysis', 'page-analysis', initAnalysisPage);
    router.register('result', 'page-result', initResultPage);
    router.register('history', 'page-history', initHistoryPage);
    router.register('settings', 'page-settings', initSettingsPage);

    // 導航連結點擊
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = e.target.closest('a').getAttribute('href').substring(1);
            router.navigate(path);
            window.history.pushState(null, '', `#${path}`);
        });
    });

    // 瀏覽器前進/後退
    window.addEventListener('popstate', () => {
        const path = window.location.hash.substring(1) || 'home';
        router.navigate(path);
    });

    // 初始路由
    const initialPath = window.location.hash.substring(1) || 'home';
    router.navigate(initialPath);
});

// 臨時佔位函數（後續任務實現）
function initUploadPage() { console.log('Upload page'); }
function initAnalysisPage() { console.log('Analysis page'); }
function initResultPage() { console.log('Result page'); }
function initHistoryPage() { console.log('History page'); }
function initSettingsPage() { console.log('Settings page'); }

// 導出供其他模組使用
export { router };
```

**驗收標準**:
- [ ] 導航切換正常
- [ ] URL hash 更新
- [ ] 前進/後退可用

**依賴**: Task 3.1.1

---

#### Task 3.1.4: 創建 API 客戶端 JS
**優先級**: P0 | **狀態**: ⬜ | **預估**: 2 小時

**檔案**: `app/static/js/api.js`

```javascript
// API 基礎 URL
const API_BASE = '/api/v1';

// API 客戶端
export const api = {
    // 上傳文件
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = (e.loaded / e.total) * 100;
                    onProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.detail || '上傳失敗'));
                }
            });

            xhr.addEventListener('error', () => reject(new Error('網絡錯誤')));

            xhr.open('POST', `${API_BASE}/upload`);
            xhr.send(formData);
        });
    },

    // 開始分析
    async createAnalysis(data) {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '創建分析失敗');
        }

        return await response.json();
    },

    // 查詢狀態
    async getAnalysisStatus(taskId) {
        const response = await fetch(`${API_BASE}/analyze/${taskId}`);

        if (!response.ok) {
            throw new Error('查詢狀態失敗');
        }

        return await response.json();
    },

    // 獲取結果
    async getAnalysisResult(taskId) {
        const response = await fetch(`${API_BASE}/result/${taskId}`);

        if (!response.ok) {
            throw new Error('獲取結果失敗');
        }

        return await response.json();
    },

    // 下載報告
    async downloadResult(taskId, format) {
        const response = await fetch(`${API_BASE}/result/${taskId}/download?format=${format}`);

        if (!response.ok) {
            throw new Error('下載失敗');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fa_report_${taskId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};
```

**驗收標準**:
- [ ] 可以調用所有 API
- [ ] 錯誤處理正確
- [ ] 上傳進度可追蹤

**依賴**: Task 2.1.1

---

### 3.2 上傳頁面 (1.5 天)

#### Task 3.2.1: 實現文件上傳 UI
**優先級**: P0 | **狀態**: ⬜ | **預估**: 4 小時

**描述**: 完成拖拽上傳和配置表單

**檔案**: 修改 `index.html` 的 `#upload-section` 部分，創建 `js/upload.js`

**驗收標準**:
- [ ] 拖拽上傳可用
- [ ] 點擊上傳可用
- [ ] 配置表單完整
- [ ] 上傳進度顯示

**依賴**: Task 3.1.4

---

### 3.3 分析進度頁面 (1 天)

#### Task 3.3.1: 實現進度追蹤 UI
**優先級**: P0 | **狀態**: ⬜ | **預估**: 3 小時

**檔案**: 修改 `index.html`，創建 `js/analysis.js`

**驗收標準**:
- [ ] 進度條實時更新
- [ ] 階段提示顯示
- [ ] 輪詢機制正常
- [ ] 完成後跳轉

**依賴**: Task 3.1.4, Task 2.2.1

---

### 3.4 結果展示頁面 (1.5 天)

#### Task 3.4.1: 實現結果顯示 UI
**優先級**: P0 | **狀態**: ⬜ | **預估**: 5 小時

**檔案**: 修改 `index.html`，創建 `js/result.js`

**包含**:
- 總分卡片
- ECharts 雷達圖
- 評分表格
- 優點/改進列表
- 下載按鈕

**驗收標準**:
- [ ] 總分突出顯示
- [ ] 雷達圖正確渲染
- [ ] 表格清晰
- [ ] 可下載報告

**依賴**: Task 3.1.4, Task 2.3.1

---

### 3.5 歷史記錄頁面 (1 天)

#### Task 3.5.1: 實現歷史記錄 UI
**優先級**: P1 | **狀態**: ⬜ | **預估**: 4 小時

**檔案**: 修改 `index.html`，創建 `js/history.js`

**驗收標準**:
- [ ] 列表顯示正常
- [ ] 可搜尋篩選
- [ ] 可查看詳情
- [ ] 可刪除記錄

**依賴**: Task 3.1.4, Task 2.4.2

---

### 3.6 設定頁面 (0.5 天)

#### Task 3.6.1: 實現設定 UI
**優先級**: P1 | **狀態**: ⬜ | **預估**: 2 小時

**檔案**: 修改 `index.html`，創建 `js/config.js`

**驗收標準**:
- [ ] 配置表單完整
- [ ] 可保存配置
- [ ] API Key 加密顯示

**依賴**: Task 3.1.4, Task 2.4.1

---

## Phase 4: 測試與部署 (Week 4)

### 4.1 測試 (2 天)

#### Task 4.1.1: 後端測試
**優先級**: P1 | **狀態**: ⬜ | **預估**: 6 小時

**描述**: 使用 pytest 測試 API

**依賴**: 所有後端任務

---

#### Task 4.1.2: 前端測試
**優先級**: P2 | **狀態**: ⬜ | **預估**: 4 小時

**描述**: 手動測試所有功能

**依賴**: 所有前端任務

---

### 4.2 Docker 容器化 (2 天)

#### Task 4.2.1: 創建 Dockerfile
**優先級**: P1 | **狀態**: ⬜ | **預估**: 3 小時

**檔案**: `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**驗收標準**:
- [ ] 可成功構建鏡像
- [ ] 容器可運行

**依賴**: 所有開發任務

---

#### Task 4.2.2: 編寫 docker-compose
**優先級**: P1 | **狀態**: ⬜ | **預估**: 2 小時

**檔案**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/results:/app/results
      - ./fa_analyzer.db:/app/fa_analyzer.db
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-default-key}
    restart: unless-stopped
```

**驗收標準**:
- [ ] `docker-compose up -d` 可啟動
- [ ] 服務正常運行

**依賴**: Task 4.2.1

---

### 4.3 文件編寫 (1 天)

#### Task 4.3.1: 編寫部署文件
**優先級**: P1 | **狀態**: ⬜ | **預估**: 3 小時

**檔案**: `docs/web_v3.0/DEPLOYMENT.md`

**依賴**: Task 4.2.2

---

#### Task 4.3.2: 編寫用戶手冊
**優先級**: P1 | **狀態**: ⬜ | **預估**: 2 小時

**檔案**: `docs/web_v3.0/USER_GUIDE.md`

**依賴**: 所有功能完成

---

## 總結

### 任務統計
- **總任務數**: 38 個
- **P0 任務**: 25 個（核心功能）
- **P1 任務**: 11 個（重要功能）
- **P2 任務**: 2 個（可選功能）

### 預估工時
- **Phase 1**: 32 小時（後端基礎）
- **Phase 2**: 32 小時（API 開發）
- **Phase 3**: 32 小時（前端開發）
- **Phase 4**: 24 小時（測試部署）
- **總計**: ~120 小時（約 3-4 週 @ 30-40 小時/週）

### 技術棧優勢
- ✅ **零前端依賴**: 無需 Node.js
- ✅ **快速開發**: 無需打包編譯
- ✅ **輕量部署**: 單一 Docker 容器
- ✅ **易於維護**: 代碼簡單直觀

---

**下一步**:
1. ✅ 確認純前端架構
2. ⬜ 創建專案目錄
3. ⬜ 開始 Task 1.1.1

**更新日誌**:
- 2025-12-01: 調整為純前端架構
