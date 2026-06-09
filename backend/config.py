from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./jobhunt.db"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    HUNTER_API_KEY: str = ""
    SERPER_API_KEY: str = ""
    SECRET_KEY: str = "change-this-in-production"
    APP_PASSWORD: Optional[str] = None
    REDIS_URL: str = "redis://localhost:6379"
    CORS_ORIGINS: str = "*"
    # Email notifications
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    ALERT_EMAIL: str = ""
    APP_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
