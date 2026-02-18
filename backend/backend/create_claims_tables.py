"""
Claims tables setup script.

Usage:
  python claims_migration.py create   # safe create if missing
  python claims_migration.py reset    # DROP + recreate (DANGEROUS)
"""

import sys
import logging
from sqlalchemy import create_engine, text
from database import DATABASE_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


DDL_ENUM = """
DO $$ BEGIN
    CREATE TYPE claim_status_enum AS ENUM ('pending','under_review','approved','rejected','completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
"""

DDL_TABLES = """
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_policy_id INTEGER NOT NULL REFERENCES user_policies(id) ON DELETE CASCADE,
    claim_number VARCHAR UNIQUE NOT NULL,
    claim_type VARCHAR NOT NULL,
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    claim_amount NUMERIC(12,2) NOT NULL CHECK (claim_amount > 0),
    status claim_status_enum NOT NULL DEFAULT 'pending',
    status_notes TEXT,
    approved_amount NUMERIC(12,2) CHECK (approved_amount IS NULL OR approved_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS claim_documents (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    file_name VARCHAR NOT NULL,
    file_type VARCHAR NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size >= 0),
    s3_key VARCHAR NOT NULL,
    s3_url VARCHAR NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
"""

DDL_UPDATED_AT_FN = """
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
"""

DDL_UPDATED_AT_TRIGGER = """
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_claims_updated_at'
    ) THEN
        CREATE TRIGGER trg_claims_updated_at
        BEFORE UPDATE ON claims
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
"""

DDL_INDEXES = """
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claim_docs_claim_id ON claim_documents(claim_id);
"""


def run_sql(conn, sql: str):
    conn.execute(text(sql))


def create_claims_tables():
    engine = create_engine(DATABASE_URL)

    with engine.begin() as conn:  # auto-commit/rollback
        logger.info("Creating enum type (if missing)...")
        run_sql(conn, DDL_ENUM)

        logger.info("Creating tables (if missing)...")
        run_sql(conn, DDL_TABLES)

        logger.info("Creating updated_at function + trigger...")
        run_sql(conn, DDL_UPDATED_AT_FN)
        run_sql(conn, DDL_UPDATED_AT_TRIGGER)

        logger.info("Creating indexes (if missing)...")
        run_sql(conn, DDL_INDEXES)

    logger.info("✅ Claims tables setup completed.")


def reset_claims_tables():
    engine = create_engine(DATABASE_URL)

    with engine.begin() as conn:
        logger.warning("⚠️ DROPPING claims tables + enum...")
        run_sql(conn, "DROP TABLE IF EXISTS claim_documents CASCADE;")
        run_sql(conn, "DROP TABLE IF EXISTS claims CASCADE;")
        run_sql(conn, "DROP TYPE IF EXISTS claim_status_enum CASCADE;")

    logger.info("✅ Dropped. Recreating...")
    create_claims_tables()


if __name__ == "__main__":
    mode = (sys.argv[1] if len(sys.argv) > 1 else "create").lower()

    if mode == "create":
        create_claims_tables()
    elif mode in ("reset", "recreate", "fix"):
        reset_claims_tables()
    else:
        raise SystemExit("Usage: python claims_migration.py [create|reset]")
