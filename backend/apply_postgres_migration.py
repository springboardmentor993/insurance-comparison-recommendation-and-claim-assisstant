#!/usr/bin/env python3
"""
PostgreSQL Migration Script
Applies rejection_reason field updates to claims and document_approvals tables
"""

import psycopg2
import sys
import os
from psycopg2 import sql

# Fix Windows encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def apply_migration():
    """Apply the rejection_reason migration to PostgreSQL"""
    
    # Database connection parameters
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'insurance_db',
        'user': 'postgres',
        'password': '958181630'
    }
    
    print("[*] Connecting to PostgreSQL database: {}".format(db_config['database']))
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        print("[+] Connected to PostgreSQL")
        
        # Start transaction
        print("[*] Starting migration...")
        
        # Check if rejection_reason column exists in claims table
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'claims' AND column_name = 'rejection_reason'
            );
        """)
        
        claims_col_exists = cursor.fetchone()[0]
        
        if not claims_col_exists:
            print("  [+] Adding rejection_reason to claims table...")
            cursor.execute("""
                ALTER TABLE claims 
                ADD COLUMN rejection_reason TEXT NULL;
            """)
            conn.commit()
            print("  [+] Added rejection_reason to claims table")
        else:
            print("  [>] rejection_reason already exists in claims table")
        
        # Check if rejection_reason column exists in document_approvals table
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'document_approvals' AND column_name = 'rejection_reason'
            );
        """)
        
        doc_col_exists = cursor.fetchone()[0]
        
        if not doc_col_exists:
            print("  [+] Adding rejection_reason to document_approvals table...")
            cursor.execute("""
                ALTER TABLE document_approvals 
                ADD COLUMN rejection_reason TEXT NULL;
            """)
            conn.commit()
            print("  [+] Added rejection_reason to document_approvals table")
        else:
            print("  [>] rejection_reason already exists in document_approvals table")
        
        print("\n[+] Migration completed successfully!")
        
        # Get table structure
        cursor.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'claims'
            ORDER BY ordinal_position;
        """)
        print("\n[*] Claims table columns:")
        for col in cursor.fetchall():
            nullable_str = 'NULL' if col[2] == 'YES' else 'NOT NULL'
            print("  - {} ({}) {}".format(col[0], col[1], nullable_str))
        
        cursor.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'document_approvals'
            ORDER BY ordinal_position;
        """)
        print("\n[*] Document Approvals table columns:")
        for col in cursor.fetchall():
            nullable_str = 'NULL' if col[2] == 'YES' else 'NOT NULL'
            print("  - {} ({}) {}".format(col[0], col[1], nullable_str))
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        print("[!] Connection error: {}".format(e))
        print("\nPlease check:")
        print("  1. PostgreSQL server is running")
        print("  2. Connection parameters are correct")
        print("  3. Database 'insurance_db' exists")
        return False
    except psycopg2.ProgrammingError as e:
        print("[!] Error: {}".format(e))
        return False
    except Exception as e:
        print("[!] Unexpected error: {}".format(e))
        return False

if __name__ == "__main__":
    success = apply_migration()
    sys.exit(0 if success else 1)
