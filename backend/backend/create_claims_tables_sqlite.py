"""
Claims tables setup script for SQLite.

Usage:
  python create_claims_tables_sqlite.py
"""

import logging
from sqlalchemy import create_engine
from database import Base, engine
from models import Claim, ClaimDocument

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_claims_tables():
    """Create claims and claim_documents tables using SQLAlchemy ORM."""
    try:
        # This will create all tables defined in models.py that don't exist
        logger.info("Creating claims tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Claims tables created successfully.")
    except Exception as e:
        logger.error(f"❌ Error creating claims tables: {e}")
        raise


if __name__ == "__main__":
    create_claims_tables()
