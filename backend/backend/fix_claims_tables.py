"""
Script to drop and recreate claims tables.
"""
from sqlalchemy import create_engine, text
from database import DATABASE_URL
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_claims_tables():
    """Drop and recreate claims tables."""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Drop existing tables if they exist
            logger.info("Dropping existing tables...")
            conn.execute(text("DROP TABLE IF EXISTS claim_documents CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS claims CASCADE;"))
            conn.execute(text("DROP TYPE IF EXISTS claim_status_enum CASCADE;"))
            conn.commit()
            logger.info("✅ Old tables dropped")
            
            # Create claim_status_enum type
            logger.info("Creating claim_status_enum type...")
            conn.execute(text("""
                CREATE TYPE claim_status_enum AS ENUM (
                    'pending', 'under_review', 'approved', 'rejected', 'completed'
                );
            """))
            conn.commit()
            logger.info("✅ Enum type created")
            
            # Create claims table
            logger.info("Creating claims table...")
            conn.execute(text("""
                CREATE TABLE claims (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    user_policy_id INTEGER NOT NULL REFERENCES user_policies(id) ON DELETE CASCADE,
                    claim_number VARCHAR UNIQUE NOT NULL,
                    claim_type VARCHAR NOT NULL,
                    incident_date DATE NOT NULL,
                    description VARCHAR NOT NULL,
                    claim_amount NUMERIC NOT NULL,
                    status claim_status_enum NOT NULL DEFAULT 'pending',
                    status_notes VARCHAR,
                    approved_amount NUMERIC,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """))
            conn.commit()
            logger.info("✅ Claims table created")
            
            # Create claim_documents table
            logger.info("Creating claim_documents table...")
            conn.execute(text("""
                CREATE TABLE claim_documents (
                    id SERIAL PRIMARY KEY,
                    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
                    file_name VARCHAR NOT NULL,
                    file_type VARCHAR NOT NULL,
                    file_size INTEGER NOT NULL,
                    s3_key VARCHAR NOT NULL,
                    s3_url VARCHAR NOT NULL,
                    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.commit()
            logger.info("✅ Claim documents table created")
            
            # Create indexes on claims table
            logger.info("Creating indexes...")
            conn.execute(text("CREATE INDEX idx_claims_user_id ON claims(user_id);"))
            conn.execute(text("CREATE INDEX idx_claims_claim_number ON claims(claim_number);"))
            conn.execute(text("CREATE INDEX idx_claims_status ON claims(status);"))
            conn.execute(text("CREATE INDEX idx_claim_documents_claim_id ON claim_documents(claim_id);"))
            conn.commit()
            logger.info("✅ Indexes created")
            
            logger.info("✅✅✅ All claims tables recreated successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error fixing claims tables: {e}")
            conn.rollback()
            raise


if __name__ == "__main__":
    fix_claims_tables()
