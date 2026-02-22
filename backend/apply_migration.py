#!/usr/bin/env python3
"""
Database Migration Script
Applies rejection_reason field updates to claims and document_approvals tables
"""

import sqlite3
import sys
from pathlib import Path

def apply_migration():
    """Apply the rejection_reason migration"""
    
    # Get database path
    db_path = Path(__file__).parent.parent / "database.db"
    
    print(f"🔄 Applying migration to database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Start transaction
        cursor.execute("BEGIN")
        
        # Check if rejection_reason column exists in claims table
        cursor.execute("PRAGMA table_info(claims)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "rejection_reason" not in columns:
            print("  ➕ Adding rejection_reason to claims table...")
            cursor.execute("""
                ALTER TABLE claims 
                ADD COLUMN rejection_reason TEXT NULL;
            """)
            print("  ✅ Added rejection_reason to claims table")
        else:
            print("  ⏭️  rejection_reason already exists in claims table")
        
        # Check if rejection_reason column exists in document_approvals table
        cursor.execute("PRAGMA table_info(document_approvals)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "rejection_reason" not in columns:
            print("  ➕ Adding rejection_reason to document_approvals table...")
            cursor.execute("""
                ALTER TABLE document_approvals 
                ADD COLUMN rejection_reason TEXT NULL;
            """)
            print("  ✅ Added rejection_reason to document_approvals table")
        else:
            print("  ⏭️  rejection_reason already exists in document_approvals table")
        
        # Commit transaction
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(claims)")
        print("\n📋 Claims table columns:")
        for col in cursor.fetchall():
            print(f"  - {col[1]} ({col[2]})")
        
        cursor.execute("PRAGMA table_info(document_approvals)")
        print("\n📋 Document Approvals table columns:")
        for col in cursor.fetchall():
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        return True
        
    except sqlite3.OperationalError as e:
        if "already exists" in str(e):
            print(f"⚠️  Column already exists: {e}")
            return True
        print(f"❌ Migration failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = apply_migration()
    sys.exit(0 if success else 1)
