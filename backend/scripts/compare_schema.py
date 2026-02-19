"""Compare actual database schema with the structure diagram."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from sqlalchemy import inspect

def check_schema():
    """Check if database schema matches the structure diagram."""
    db = SessionLocal()
    inspector = inspect(db.bind)
    
    # Define expected schema from the diagram
    expected_tables = {
        'users': ['id', 'name', 'email', 'password', 'dob', 'risk_profile', 'created_at'],
        'providers': ['id', 'name', 'country', 'created_at'],
        'policies': ['id', 'provider_id', 'policy_type', 'title', 'coverage', 'premium', 'term_months', 'deductible', 'tnc_url', 'created_at'],
        'userpolicies': ['id', 'user_id', 'policy_id', 'policy_number', 'start_date', 'end_date', 'premium', 'status', 'auto_renew'],
        'claims': ['id', 'user_policy_id', 'claim_number', 'claim_type', 'incident_date', 'amount_claimed', 'status', 'created_at'],
        'claimdocuments': ['id', 'claim_id', 'file_url', 'doc_type', 'uploaded_at'],
        'recommendations': ['id', 'user_id', 'policy_id', 'score', 'reason', 'created_at'],
        'adminlogs': ['id', 'admin_id', 'action', 'target_type', 'target_id', 'timestamp'],
        'fraudflags': ['id', 'claim_id', 'rule_code', 'severity', 'details', 'created_at']
    }
    
    print("=" * 80)
    print("DATABASE SCHEMA COMPARISON")
    print("=" * 80)
    
    # Get actual tables
    actual_tables = inspector.get_table_names()
    
    print(f"\n✅ Tables found: {len(actual_tables)}")
    for table in sorted(actual_tables):
        print(f"  - {table}")
    
    # Check each table
    all_match = True
    
    for table_name, expected_columns in expected_tables.items():
        print(f"\n{'=' * 80}")
        print(f"TABLE: {table_name}")
        print(f"{'=' * 80}")
        
        if table_name not in actual_tables:
            print(f"❌ TABLE MISSING: {table_name}")
            all_match = False
            continue
        
        # Get actual columns
        actual_columns = [col['name'] for col in inspector.get_columns(table_name)]
        
        # Check for missing columns
        missing_columns = set(expected_columns) - set(actual_columns)
        extra_columns = set(actual_columns) - set(expected_columns)
        matching_columns = set(expected_columns) & set(actual_columns)
        
        if missing_columns:
            print(f"\n❌ MISSING COLUMNS ({len(missing_columns)}):")
            for col in sorted(missing_columns):
                print(f"   - {col}")
            all_match = False
        
        if matching_columns:
            print(f"\n✅ PRESENT COLUMNS ({len(matching_columns)}):")
            for col in sorted(matching_columns):
                col_info = next(c for c in inspector.get_columns(table_name) if c['name'] == col)
                print(f"   - {col:25} {str(col_info['type'])}")
        
        if extra_columns:
            print(f"\nℹ️  EXTRA COLUMNS (not in diagram, but present) ({len(extra_columns)}):")
            for col in sorted(extra_columns):
                col_info = next(c for c in inspector.get_columns(table_name) if c['name'] == col)
                print(f"   - {col:25} {str(col_info['type'])}")
    
    print("\n" + "=" * 80)
    if all_match:
        print("✅ SCHEMA MATCHES DIAGRAM PERFECTLY!")
    else:
        print("⚠️  SCHEMA HAS DIFFERENCES FROM DIAGRAM")
        print("\nTo update your schema to match the diagram, run:")
        print("  python backend/scripts/add_userpolicies_fields_migration.py")
    print("=" * 80)
    
    db.close()

if __name__ == "__main__":
    check_schema()
