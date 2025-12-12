"""
分析任務 API
提供 FA 報告分析任務的創建、查詢和管理功能
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import logging

from ..database import get_db, SessionLocal
from ..models.task import AnalysisTask, TaskStatus
from ..models.config import SystemConfig
from ..schemas.task import AnalysisTaskCreate, AnalysisTaskResponse
from ..services.analyzer import FAReportAnalyzerService
from ..services.task_manager import TaskManager
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["analyze"])
logger = logging.getLogger(__name__)


def get_config_value(db: Session, key: str, default: str = None) -> str:
    """
    從數據庫獲取配置值

    Args:
        db: 數據庫會話
        key: 配置鍵
        default: 默認值

    Returns:
        配置值
    """
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if config:
        return config.value
    return default


async def run_analysis_background(task_id: str, file_path: str, config: dict):
    """
    後台分析任務執行函數

    Args:
        task_id: 任務 ID
        file_path: 文件路徑
        config: 分析配置
    """
    db = SessionLocal()

    try:
        logger.info(f"開始後台分析任務: {task_id}")

        # 記錄分析配置
        backend = config["backend"]
        model = config.get("model") or "auto"
        base_url = config.get("base_url")
        skip_images = config.get("skip_images", False)

        logger.info(f"✓ 使用 {backend.upper()} 後端: {model}")
        if base_url:
            logger.info(f"✓ Base URL: {base_url}")
        if skip_images:
            logger.info(f"✓ 跳過圖片分析")

        # 更新任務狀態為處理中
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.PROCESSING.value
            db.commit()

        # 創建分析服務
        analyzer = FAReportAnalyzerService()

        # 進度回調函數
        def progress_callback(progress: int, message: str):
            TaskManager.update_progress(db, task_id, progress, message)
            logger.info(f"任務 {task_id} 進度: {progress}% - {message}")

        # 執行分析
        result = await analyzer.analyze_report(
            file_path=file_path,
            backend=backend,
            model=config.get("model"),
            api_key=config.get("api_key"),
            base_url=base_url,
            skip_images=skip_images,
            progress_callback=progress_callback
        )

        # 標記任務完成
        TaskManager.mark_completed(db, task_id, result)
        logger.info(f"任務 {task_id} 完成")

    except Exception as e:
        logger.error(f"任務 {task_id} 失敗: {str(e)}")
        TaskManager.mark_failed(db, task_id, str(e))

    finally:
        db.close()


@router.post("/analyze", response_model=AnalysisTaskResponse)
async def create_analysis_task(
    request: AnalysisTaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    創建分析任務

    Args:
        request: 分析任務創建請求
        - file_id: 上傳的文件 ID
        - backend: LLM 後端 (ollama, openai, anthropic)
        - model: 模型名稱 (可選)
        - api_key: API 密鑰 (可選)
        - skip_images: 是否跳過圖片處理

    Returns:
        任務信息,包含 task_id 用於後續查詢
    """

    # 查找上傳的文件
    upload_dir = Path(settings.UPLOAD_DIR)
    matching_files = list(upload_dir.glob(f"{request.file_id}.*"))

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail=f"文件不存在: {request.file_id}"
        )

    file_path = str(matching_files[0])
    # 使用用戶提供的原始文件名,如果沒有則使用服務器文件名
    filename = request.filename if request.filename else matching_files[0].name

    # 驗證 backend
    valid_backends = ["ollama", "openai", "anthropic"]
    if request.backend not in valid_backends:
        raise HTTPException(
            status_code=400,
            detail=f"不支援的 backend: {request.backend}。支援: {', '.join(valid_backends)}"
        )

    # 處理 API Key 和 base_url：優先級為 請求參數 > 數據庫配置 > 環境變量
    api_key = request.api_key
    base_url = request.base_url
    model = request.model

    # 如果沒有提供，依次從數據庫和環境變量讀取
    if request.backend == "openai":
        # API Key
        if not api_key:
            # 先從數據庫讀取
            db_api_key = get_config_value(db, 'openai_api_key')
            if db_api_key:
                api_key = db_api_key
                logger.info("使用數據庫中的 OPENAI_API_KEY")
            elif settings.OPENAI_API_KEY:
                api_key = settings.OPENAI_API_KEY
                logger.info("使用環境變量中的 OPENAI_API_KEY")

        # Base URL
        if not base_url:
            # 先從數據庫讀取
            db_base_url = get_config_value(db, 'openai_base_url')
            if db_base_url:
                base_url = db_base_url
                logger.info(f"使用數據庫中的 OPENAI_BASE_URL: {base_url}")
            elif settings.OPENAI_BASE_URL:
                base_url = settings.OPENAI_BASE_URL
                logger.info(f"使用環境變量中的 OPENAI_BASE_URL: {base_url}")

        # Model
        if not model:
            # 先從數據庫讀取
            db_model = get_config_value(db, 'default_model')
            if db_model:
                model = db_model
                logger.info(f"使用數據庫中的 DEFAULT_MODEL: {model}")
            elif settings.DEFAULT_MODEL:
                model = settings.DEFAULT_MODEL
                logger.info(f"使用環境變量中的 DEFAULT_MODEL: {model}")

    elif request.backend == "ollama":
        # Ollama Base URL
        if not base_url:
            db_base_url = get_config_value(db, 'ollama_base_url')
            if db_base_url:
                base_url = db_base_url
                logger.info(f"使用數據庫中的 OLLAMA_BASE_URL: {base_url}")
            elif settings.OLLAMA_BASE_URL:
                base_url = settings.OLLAMA_BASE_URL
                logger.info(f"使用環境變量中的 OLLAMA_BASE_URL: {base_url}")

    # 創建分析任務
    task = AnalysisTask(
        filename=filename,
        file_path=file_path,
        status=TaskStatus.PENDING.value,
        backend=request.backend,
        model=model or "auto",
        skip_images=1 if request.skip_images else 0
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    logger.info(f"創建分析任務: {task.id} - {filename}")

    # 啟動後台任務
    background_tasks.add_task(
        run_analysis_background,
        task.id,
        file_path,
        {
            "backend": request.backend,
            "model": model,
            "api_key": api_key,
            "base_url": base_url,
            "skip_images": request.skip_images
        }
    )

    return task.to_dict()


@router.get("/analyze/{task_id}", response_model=AnalysisTaskResponse)
async def get_analysis_status(task_id: str, db: Session = Depends(get_db)):
    """
    查詢分析任務狀態

    Args:
        task_id: 任務 ID

    Returns:
        任務當前狀態,包括進度、狀態、錯誤信息等
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"任務不存在: {task_id}"
        )

    return task.to_dict()


@router.delete("/analyze/{task_id}")
async def cancel_analysis_task(task_id: str, db: Session = Depends(get_db)):
    """
    取消分析任務 (僅限未開始或進行中的任務)

    Args:
        task_id: 任務 ID

    Returns:
        取消結果
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"任務不存在: {task_id}"
        )

    if task.status == TaskStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail="任務已完成,無法取消"
        )

    if task.status == TaskStatus.FAILED.value:
        raise HTTPException(
            status_code=400,
            detail="任務已失敗,無需取消"
        )

    # 標記為失敗(取消)
    task.status = TaskStatus.FAILED.value
    task.error = "任務已被用戶取消"
    db.commit()

    logger.info(f"任務已取消: {task_id}")

    return {
        "message": "任務已取消",
        "task_id": task_id
    }
