"""Verify that models.py matches actual database schema."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from sqlalchemy import inspect

db = SessionLocal()
inspector = inspect(db.bind)

print("=" * 80)
print("MODELS VS DATABASE SCHEMA VERIFICATION")
print("=" * 80)

# Check critical tables with new fields
tables_to_check = {
    'userpolicies': [
        'id', 'user_id', 'policy_id', 'policy_number', 'start_date', 
        'end_date', 'premium', 'status', 'auto_renew', 'purchased_at'
    ],
    'fraudflags': [
        'id', 'claim_id', 'rule_code', 'severity', 'details', 'created_at',
        'reason', 'flagged_by', 'flagged_at'
    ],
    'users': ['id', 'name', 'email', 'password', 'dob', 'role', 'risk_profile'],
    'policies': ['id', 'provider_id', 'policy_type', 'title', 'coverage', 
                 'premium', 'term_months', 'deductible', 'claim_settlement_ratio',
                 'provider_rating', 'created_at'],
    'claims': ['id', 'user_policy_id', 'claim_number', 'claim_type', 
               'incident_date', 'amount_claimed', 'status', 'created_at']
}

all_match = True

for table_name, expected_cols in tables_to_check.items():
    print(f"\n{table_name.upper()}:")
    print("-" * 80)
    
    # Get actual columns from database
    actual_cols = [col['name'] for col in inspector.get_columns(table_name)]
    
    # Check if all expected columns exist
    missing = set(expected_cols) - set(actual_cols)
    
    if missing:
        print(f"  MISMATCH - Missing columns in database: {missing}")
        all_match = False
    else:
        print(f"  OK - All model fields exist in database ({len(expected_cols)} columns)")
        
        # Show the columns with types
        print("\n  Columns:")
        for col in inspector.get_columns(table_name):
            if col['name'] in expected_cols:
                nullable = "NULL" if col['nullable'] else "NOT NULL"
                print(f"    {col['name']:25} {str(col['type']):20} {nullable}")

print("\n" + "=" * 80)
if all_match:
    print("SUCCESS: All model fields exist in the database!")
else:
    print("WARNING: Some model fields are missing from database")
print("=" * 80)

db.close()
