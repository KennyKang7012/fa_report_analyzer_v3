from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class DimensionScore(BaseModel):
    """Schema for a single dimension score"""
    name: str
    score: float
    max_score: float
    percentage: float
    comments: List[str]


class AnalysisResult(BaseModel):
    """Schema for analysis result"""
    task_id: str
    total_score: float
    max_total_score: float
    percentage: float
    grade: str
    dimension_scores: Dict[str, DimensionScore]
    strengths: List[str]
    improvements: List[str]
    summary: str
    analysis_time: Optional[str] = None


class ResultDownloadRequest(BaseModel):
    """Schema for result download request"""
    format: str  # "txt" or "json"
