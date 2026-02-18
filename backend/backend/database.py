from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# DATABASE CONFIG
# =========================

# SQLite (safe + simple for development)
SQLALCHEMY_DATABASE_URL = "sqlite:///./insurenz.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # required for SQLite
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# =========================
# DEPENDENCY
# =========================
def get_db():
    """
    FastAPI dependency to get DB session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
