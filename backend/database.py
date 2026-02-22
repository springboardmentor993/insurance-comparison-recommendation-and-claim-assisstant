from sqlalchemy import create_engine  # noqa: F401
from sqlalchemy.orm import sessionmaker, declarative_base  # noqa: F401

# PostgreSQL connection
DATABASE_URL = "postgresql://postgres:958181630@localhost:5432/insurance_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
