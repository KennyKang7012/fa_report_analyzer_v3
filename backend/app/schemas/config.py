from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConfigItem(BaseModel):
    """Schema for a single configuration item"""
    key: str
    value: str
    encrypt: bool = False


class ConfigUpdate(BaseModel):
    """Schema for batch updating configuration"""
    configs: List[ConfigItem]


class ConfigResponse(BaseModel):
    """Schema for configuration response"""
    id: int
    key: str
    value: str
    is_encrypted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
