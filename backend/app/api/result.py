"""
結果查詢 API
提供分析結果的查詢和下載功能
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
import json
import logging

from ..database import get_db
from ..models.task import AnalysisTask, TaskStatus
from ..schemas.result import AnalysisResult

router = APIRouter(prefix="/api/v1", tags=["result"])
logger = logging.getLogger(__name__)


@router.get("/result/{task_id}", response_model=AnalysisResult)
async def get_analysis_result(task_id: str, db: Session = Depends(get_db)):
    """
    獲取分析結果

    Args:
        task_id: 任務 ID

    Returns:
        完整的分析結果,包括總分、各維度評分、優點和改進建議
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail=f"任務不存在: {task_id}"
        )

    if task.status == TaskStatus.PENDING.value:
        raise HTTPException(
            status_code=400,
            detail="任務尚未開始處理"
        )

    if task.status == TaskStatus.PROCESSING.value:
        raise HTTPException(
            status_code=400,
            detail=f"任務處理中,進度: {task.progress}%"
        )

    if task.status == TaskStatus.FAILED.value:
        raise HTTPException(
            status_code=400,
            detail=f"任務執行失敗: {task.error}"
        )

    if not task.result:
        raise HTTPException(
            status_code=500,
            detail="任務已完成但結果數據缺失"
        )

    logger.info(f"返回分析結果: {task_id}")

    return {
        "task_id": task.id,
        "filename": task.filename,
        **task.result
    }


@router.get("/result/{task_id}/download")
async def download_result(
    task_id: str,
    format: str = Query("txt", regex="^(txt|json)$"),
    db: Session = Depends(get_db)
):
    """
    下載分析報告

    Args:
        task_id: 任務 ID
        format: 下載格式 (txt 或 json)

    Returns:
        文件下載響應
    """
    task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    if not task or task.status != TaskStatus.COMPLETED.value or not task.result:
        raise HTTPException(
            status_code=404,
            detail="結果不存在或任務未完成"
        )

    try:
        if format == "json":
            # JSON 格式下載
            content = json.dumps(task.result, ensure_ascii=False, indent=2)
            media_type = "application/json"
            filename = f"fa_report_{task_id}.json"

        elif format == "txt":
            # TXT 格式下載 - 生成格式化文本報告
            content = generate_text_report(task.result, task.filename)
            media_type = "text/plain; charset=utf-8"
            filename = f"fa_report_{task_id}.txt"

        else:
            raise HTTPException(
                status_code=400,
                detail=f"不支援的格式: {format}"
            )

        logger.info(f"下載報告: {task_id} - {format}")

        return Response(
            content=content.encode("utf-8"),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": f"{media_type}; charset=utf-8"
            }
        )

    except Exception as e:
        logger.error(f"下載報告失敗: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"生成報告失敗: {str(e)}"
        )


def generate_text_report(result: dict, source_file: str) -> str:
    """
    生成文本格式的分析報告

    Args:
        result: 分析結果字典
        source_file: 源文件名

    Returns:
        格式化的文本報告
    """
    lines = []
    lines.append("=" * 80)
    lines.append("FA 報告評分結果")
    lines.append("=" * 80)
    lines.append(f"\n來源文件: {source_file}")
    lines.append(f"總分: {result.get('total_score', 0):.2f} / 100")
    lines.append(f"等級: {result.get('grade', 'N/A')}")
    lines.append("")

    # 各維度評分
    lines.append("-" * 80)
    lines.append("各維度評分詳情")
    lines.append("-" * 80)

    dimensions = result.get("dimension_scores", {})
    for dimension_name, dimension_data in dimensions.items():
        score = dimension_data.get("score", 0)
        percentage = dimension_data.get("percentage", 0)
        weight = dimension_data.get("weight", 0)
        weighted = dimension_data.get("weighted_score", 0)

        lines.append(f"\n【{dimension_name}】")
        lines.append(f"  得分: {score:.1f} / 100  ({percentage:.1f}%)")
        lines.append(f"  權重: {weight * 100:.0f}%")
        lines.append(f"  加權分數: {weighted:.2f}")

        # 評語
        comments = dimension_data.get("comments", [])
        if comments:
            lines.append("  評語:")
            for comment in comments:
                lines.append(f"    - {comment}")

    # 優點
    strengths = result.get("strengths", [])
    if strengths:
        lines.append("\n" + "-" * 80)
        lines.append("報告優點")
        lines.append("-" * 80)
        for i, strength in enumerate(strengths, 1):
            lines.append(f"{i}. {strength}")

    # 改進建議
    improvements = result.get("improvements", [])
    if improvements:
        lines.append("\n" + "-" * 80)
        lines.append("改進建議")
        lines.append("-" * 80)
        for i, improvement in enumerate(improvements, 1):
            lines.append(f"{i}. {improvement}")

    # 總結評語
    summary = result.get("summary", "")
    if summary:
        lines.append("\n" + "-" * 80)
        lines.append("總結評語")
        lines.append("-" * 80)
        lines.append(summary)

    lines.append("\n" + "=" * 80)
    lines.append("報告結束")
    lines.append("=" * 80)

    return "\n".join(lines)
