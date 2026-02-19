from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config.settings import settings

# Create database engine using settings (no hardcoded credentials)
engine = create_engine(settings.DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """Dependency that provides a database session for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
