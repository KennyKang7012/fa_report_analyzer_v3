from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AnalysisTaskCreate(BaseModel):
    """Schema for creating a new analysis task"""
    file_id: str
    backend: str = Field(default="ollama", description="LLM backend (ollama, openai, anthropic)")
    model: Optional[str] = Field(default=None, description="Model name (auto if not specified)")
    api_key: Optional[str] = Field(default=None, description="API key for the LLM backend")
    skip_images: bool = Field(default=False, description="Skip image analysis")


class AnalysisTaskResponse(BaseModel):
    """Schema for analysis task response"""
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
