"""
歷史記錄 API
提供分析任務歷史記錄的查詢、篩選和管理功能
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..database import get_db
from ..models.task import AnalysisTask, TaskStatus
from ..schemas.task import AnalysisTaskResponse

router = APIRouter(prefix="/api/v1", tags=["history"])
logger = logging.getLogger(__name__)


@router.get("/history", response_model=List[AnalysisTaskResponse])
async def get_history(
    status: Optional[str] = Query(None, description="過濾狀態: pending, processing, completed, failed"),
    backend: Optional[str] = Query(None, description="過濾 LLM 後端"),
    filename: Optional[str] = Query(None, description="搜尋文件名"),
    days: Optional[int] = Query(None, description="最近 N 天的記錄"),
    limit: int = Query(50, ge=1, le=500, description="返回數量限制"),
    offset: int = Query(0, ge=0, description="偏移量"),
    db: Session = Depends(get_db)
):
    """
    獲取分析任務歷史記錄

    支援多種過濾條件:
    - status: 任務狀態
    - backend: LLM 後端
    - filename: 文件名搜尋 (模糊匹配)
    - days: 最近 N 天
    - limit: 返回數量
    - offset: 分頁偏移

    Returns:
        任務列表,按創建時間倒序排列
    """
    # 基礎查詢
    query = db.query(AnalysisTask)

    # 過濾狀態
    if status:
        if status not in [s.value for s in TaskStatus]:
            raise HTTPException(
                status_code=400,
                detail=f"無效的狀態: {status}"
            )
        query = query.filter(AnalysisTask.status == status)

    # 過濾後端
    if backend:
        query = query.filter(AnalysisTask.backend == backend)

    # 搜尋文件名
    if filename:
        query = query.filter(AnalysisTask.filename.like(f"%{filename}%"))

    # 時間範圍過濾
    if days:
        cutoff_date = datetime.now() - timedelta(days=days)
        query = query.filter(AnalysisTask.created_at >= cutoff_date)

    # 排序和分頁
    query = query.order_by(desc(AnalysisTask.created_at))
    query = query.offset(offset).limit(limit)

    # 執行查詢
    tasks = query.all()

    logger.info(f"查詢歷史記錄: {len(tasks)} 條 (status={status}, backend={backend}, filename={filename})")

    return [task.to_dict() for task in tasks]


@router.get("/history/{task_id}", response_model=AnalysisTaskResponse)
async def get_history_detail(task_id: str, db: Session = Depends(get_db)):
    """
    獲取單個歷史記錄詳情

    Args:
        task_id: 任務 ID

    Returns:
        任務詳細信息
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"任務不存在: {task_id}"
        )

    return task.to_dict()


@router.delete("/history/{task_id}")
async def delete_history(task_id: str, db: Session = Depends(get_db)):
    """
    刪除歷史記錄

    Args:
        task_id: 任務 ID

    Returns:
        刪除結果
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"任務不存在: {task_id}"
        )

    # 刪除關聯的上傳文件
    from pathlib import Path
    if task.file_path and Path(task.file_path).exists():
        try:
            Path(task.file_path).unlink()
            logger.info(f"已刪除文件: {task.file_path}")
        except Exception as e:
            logger.warning(f"刪除文件失敗: {str(e)}")

    # 刪除數據庫記錄
    db.delete(task)
    db.commit()

    logger.info(f"已刪除歷史記錄: {task_id}")

    return {
        "message": "歷史記錄刪除成功",
        "task_id": task_id
    }


@router.delete("/history")
async def batch_delete_history(
    task_ids: List[str] = Query(..., description="任務 ID 列表"),
    db: Session = Depends(get_db)
):
    """
    批量刪除歷史記錄

    Args:
        task_ids: 任務 ID 列表

    Returns:
        刪除結果統計
    """
    deleted_count = 0
    failed_count = 0
    errors = []

    for task_id in task_ids:
        try:
            task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

            if task:
                # 刪除關聯文件
                from pathlib import Path
                if task.file_path and Path(task.file_path).exists():
                    try:
                        Path(task.file_path).unlink()
                    except Exception as e:
                        logger.warning(f"刪除文件失敗: {str(e)}")

                # 刪除數據庫記錄
                db.delete(task)
                deleted_count += 1
            else:
                failed_count += 1
                errors.append(f"任務不存在: {task_id}")

        except Exception as e:
            failed_count += 1
            errors.append(f"{task_id}: {str(e)}")
            logger.error(f"刪除任務失敗 {task_id}: {str(e)}")

    db.commit()

    logger.info(f"批量刪除歷史記錄: 成功 {deleted_count}, 失敗 {failed_count}")

    return {
        "message": f"批量刪除完成",
        "deleted": deleted_count,
        "failed": failed_count,
        "errors": errors if errors else None
    }


@router.get("/history/stats/summary")
async def get_history_stats(db: Session = Depends(get_db)):
    """
    獲取歷史統計信息

    Returns:
        統計數據,包括總數、各狀態數量等
    """
    # 總任務數
    total = db.query(AnalysisTask).count()

    # 各狀態數量
    pending = db.query(AnalysisTask).filter(AnalysisTask.status == TaskStatus.PENDING.value).count()
    processing = db.query(AnalysisTask).filter(AnalysisTask.status == TaskStatus.PROCESSING.value).count()
    completed = db.query(AnalysisTask).filter(AnalysisTask.status == TaskStatus.COMPLETED.value).count()
    failed = db.query(AnalysisTask).filter(AnalysisTask.status == TaskStatus.FAILED.value).count()

    # 各後端使用統計
    backend_stats = {}
    for backend in ["ollama", "openai", "anthropic"]:
        count = db.query(AnalysisTask).filter(AnalysisTask.backend == backend).count()
        backend_stats[backend] = count

    # 最近 7 天的任務數
    cutoff_date = datetime.now() - timedelta(days=7)
    recent_7_days = db.query(AnalysisTask).filter(AnalysisTask.created_at >= cutoff_date).count()

    # 最近 30 天的任務數
    cutoff_date_30 = datetime.now() - timedelta(days=30)
    recent_30_days = db.query(AnalysisTask).filter(AnalysisTask.created_at >= cutoff_date_30).count()

    return {
        "total": total,
        "by_status": {
            "pending": pending,
            "processing": processing,
            "completed": completed,
            "failed": failed
        },
        "by_backend": backend_stats,
        "recent": {
            "last_7_days": recent_7_days,
            "last_30_days": recent_30_days
        }
    }
