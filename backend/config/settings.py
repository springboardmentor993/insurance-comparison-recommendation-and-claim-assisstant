"""
Application settings with environment variable support.

Follows Dependency Inversion Principle:
- High-level modules depend on this abstraction
- Configuration details are isolated from business logic
"""
import os
from functools import lru_cache
from typing import List

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, use environment variables directly


class Settings:
    """
    Centralized application settings.
    
    All configuration is loaded from environment variables with sensible defaults.
    This allows different configurations for dev/staging/production without code changes.
    """
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:jeshwanth72@localhost/insurance_db"
    )
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "30"))
    
    # Application
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Celery / Redis
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_S3_BUCKET_NAME: str = os.getenv("AWS_S3_BUCKET_NAME", "insureme-claim-docs")
    AWS_S3_REGION: str = os.getenv("AWS_S3_REGION", "ap-southeast-2")
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
        )
        return [origin.strip() for origin in origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Using lru_cache ensures settings are only loaded once.
    """
    return Settings()


# Convenience access
settings = get_settings()
