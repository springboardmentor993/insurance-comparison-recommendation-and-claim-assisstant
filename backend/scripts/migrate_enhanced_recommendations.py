"""
Database migration: Add enhanced recommendation fields.
Adds claim_settlement_ratio and provider_rating to policies table.
Adds reliability_score to providers table.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import SessionLocal


def migrate():
    """Run migration to add new fields for enhanced recommendations."""
    db = SessionLocal()
    try:
        print("🔄 Starting enhanced recommendation migration...")
        
        # Add claim_settlement_ratio to policies
        print("  ➕ Adding claim_settlement_ratio to policies table...")
        db.execute(text("""
            ALTER TABLE policies
            ADD COLUMN IF NOT EXISTS claim_settlement_ratio NUMERIC(5,2)
        """))
        
        # Add provider_rating to policies
        print("  ➕ Adding provider_rating to policies table...")
        db.execute(text("""
            ALTER TABLE policies
            ADD COLUMN IF NOT EXISTS provider_rating NUMERIC(3,2)
        """))
        
        # Add reliability_score to providers
        print("  ➕ Adding reliability_score to providers table...")
        db.execute(text("""
            ALTER TABLE providers
            ADD COLUMN IF NOT EXISTS reliability_score NUMERIC(3,2)
        """))
        
        db.commit()
        print("✅ Migration completed successfully!")
        
        # Verify the new columns
        print("\n📋 Verifying new columns...")
        result = db.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'policies' 
            AND column_name IN ('claim_settlement_ratio', 'provider_rating')
            ORDER BY column_name
        """))
        print("  Policies table:")
        for row in result:
            print(f"    - {row[0]}: {row[1]}")
            
        result = db.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'providers' 
            AND column_name = 'reliability_score'
        """))
        print("  Providers table:")
        for row in result:
            print(f"    - {row[0]}: {row[1]}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
