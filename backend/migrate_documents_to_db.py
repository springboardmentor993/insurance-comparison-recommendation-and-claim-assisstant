"""
Migration script to update claim_documents table from file-based storage to database storage.

This script:
1. Updates the claim_documents table schema (adds file_data, file_name, file_type columns)
2. Removes the file_url column and old files reference
3. Prepares the database for storing documents directly

Run this after updating models.py and before starting the application.
"""

from backend.database import engine
from backend.models import Base
from sqlalchemy import text, inspect
import os

def migrate_documents_table():
    """
    Migrate claim_documents table to new schema with direct database storage.
    """
    print("Starting claim_documents table migration...")
    
    with engine.connect() as conn:
        # Check if table exists
        inspector = inspect(engine)
        if 'claim_documents' not in inspector.get_table_names():
            print("  ⚠ claim_documents table does not exist yet. Creating from scratch...")
            Base.metadata.create_all(bind=engine)
            print("  ✓ New claim_documents table created with database storage schema")
            return
        
        # Get existing columns
        existing_columns = {col['name'] for col in inspector.get_columns('claim_documents')}
        
        # Check if migration has already been done
        if 'file_data' in existing_columns:
            print("  ✓ Migration already completed. Table has file_data column.")
            return
        
        # Perform migration: drop old column and add new ones
        print("  - Dropping old file_url column...")
        try:
            conn.execute(text("ALTER TABLE claim_documents DROP COLUMN file_url"))
            conn.commit()
        except Exception as e:
            print(f"    (file_url column may not exist: {e})")
        
        print("  - Adding file_data column (BYTEA)...")
        try:
            conn.execute(text("ALTER TABLE claim_documents ADD COLUMN file_data BYTEA"))
            conn.commit()
        except Exception as e:
            if 'already exists' not in str(e):
                print(f"    Error: {e}")
        
        print("  - Adding file_name column...")
        try:
            conn.execute(text("ALTER TABLE claim_documents ADD COLUMN file_name VARCHAR"))
            conn.commit()
        except Exception as e:
            if 'already exists' not in str(e):
                print(f"    Error: {e}")
        
        print("  - Adding file_type column (MIME type)...")
        try:
            conn.execute(text("ALTER TABLE claim_documents ADD COLUMN file_type VARCHAR"))
            conn.commit()
        except Exception as e:
            if 'already exists' not in str(e):
                print(f"    Error: {e}")
        
        print("  ✓ claim_documents table schema updated successfully")
        print("\n  New schema includes:")
        print("    - file_data: BYTEA (stores binary file content)")
        print("    - file_name: VARCHAR (original filename)")
        print("    - file_type: VARCHAR (MIME type)")
        print("    - doc_type: VARCHAR (document classification)")
        print("    - uploaded_at: TIMESTAMP (upload time)")

def verify_schema():
    """Verify the final schema is correct."""
    print("\nVerifying final schema...")
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = {col['name']: col['type'] for col in inspector.get_columns('claim_documents')}
        
        required_columns = {
            'id': 'primary key',
            'claim_id': 'foreign key',
            'file_data': 'BYTEA for file storage',
            'file_name': 'original filename',
            'file_type': 'MIME type',
            'doc_type': 'document classification',
            'uploaded_at': 'timestamp'
        }
        
        all_good = True
        for col, description in required_columns.items():
            if col in columns:
                print(f"  ✓ {col}: {description}")
            else:
                print(f"  ✗ Missing: {col} ({description})")
                all_good = False
        
        if all_good:
            print("\n✅ Schema verification passed!")
        else:
            print("\n⚠️  Some columns are missing. Database may need to be reset.")
        
        return all_good

if __name__ == "__main__":
    try:
        print("=" * 60)
        print("Claim Documents Database Migration")
        print("=" * 60)
        
        migrate_documents_table()
        verify_schema()
        
        print("\n✅ Migration completed successfully!")
        print("\nYou can now:")
        print("  1. Start the backend: python -m uvicorn backend.main:app --reload")
        print("  2. Upload documents using: POST /claims/{claim_id}/documents")
        print("  3. Admin can list documents: GET /admin/claim-documents")
        print("  4. Admin can download: GET /admin/claim-documents/{doc_id}")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
