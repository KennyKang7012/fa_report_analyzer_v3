from sqlalchemy.orm import Session
from ..models.task import AnalysisTask, TaskStatus
from datetime import datetime
from typing import Dict, Any


class TaskManager:
    """Task Management Service"""

    @staticmethod
    def update_progress(db: Session, task_id: str, progress: int, message: str = ""):
        """
        Update task progress

        Args:
            db: Database session
            task_id: Task ID
            progress: Progress percentage (0-100)
            message: Progress message
        """
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.progress = progress
            task.message = message
            task.status = TaskStatus.PROCESSING.value if progress < 100 else task.status
            db.commit()

    @staticmethod
    def mark_completed(db: Session, task_id: str, result: Dict[str, Any]):
        """
        Mark task as completed

        Args:
            db: Database session
            task_id: Task ID
            result: Analysis result dictionary
        """
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.COMPLETED.value
            task.progress = 100
            task.result = result
            task.completed_at = datetime.now()
            db.commit()

    @staticmethod
    def mark_failed(db: Session, task_id: str, error: str):
        """
        Mark task as failed

        Args:
            db: Database session
            task_id: Task ID
            error: Error message
        """
        task = db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()
        if task:
            task.status = TaskStatus.FAILED.value
            task.error = error
            db.commit()

    @staticmethod
    def get_task(db: Session, task_id: str) -> AnalysisTask:
        """
        Get task by ID

        Args:
            db: Database session
            task_id: Task ID

        Returns:
            Analysis task or None
        """
        return db.query(AnalysisTask).filter(AnalysisTask.id == task_id).first()

    @staticmethod
    def list_tasks(db: Session, limit: int = 50, offset: int = 0):
        """
        List all tasks

        Args:
            db: Database session
            limit: Maximum number of tasks to return
            offset: Offset for pagination

        Returns:
            List of analysis tasks
        """
        return db.query(AnalysisTask).order_by(
            AnalysisTask.created_at.desc()
        ).limit(limit).offset(offset).all()
