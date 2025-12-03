from pydantic import BaseModel
from typing import Optional


class ConfigItem(BaseModel):
    """Schema for a single configuration item"""
    key: str
    value: str


class ConfigUpdate(BaseModel):
    """Schema for updating configuration"""
    backend: Optional[str] = None
    model: Optional[str] = None
    api_key: Optional[str] = None
    skip_images: Optional[bool] = None


class ConfigResponse(BaseModel):
    """Schema for configuration response"""
    backend: str
    model: Optional[str] = None
    has_api_key: bool  # Don't return the actual key, just whether it exists
    skip_images: bool
