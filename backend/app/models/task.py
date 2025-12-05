from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum
from datetime import datetime


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
    error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        # 清理 result 中的 grade 字段，移除"級"字
        result = self.result
        if result and isinstance(result, dict) and 'grade' in result:
            result = dict(result)  # 創建副本避免修改原始數據
            result['grade'] = result['grade'].replace('級', '')

        return {
            "task_id": self.id,
            "filename": self.filename,
            "status": self.status,
            "progress": self.progress,
            "message": self.message,
            "result": result,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error": self.error
        }
