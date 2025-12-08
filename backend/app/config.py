from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    # Application settings
    DATABASE_URL: str = "sqlite:///./fa_analyzer.db"
    ENCRYPTION_KEY: Optional[str] = None
    UPLOAD_DIR: str = "uploads"
    RESULT_DIR: str = "results"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB

    # LLM settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None
    DEFAULT_MODEL: Optional[str] = None
    OLLAMA_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
