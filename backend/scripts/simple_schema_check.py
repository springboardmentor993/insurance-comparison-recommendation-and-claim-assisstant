"""Simple schema comparison against diagram."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from sqlalchemy import inspect

db = SessionLocal()
inspector = inspect(db.bind)

# Expected from diagram
expected = {
    'userpolicies': ['id', 'user_id', 'policy_id', 'policy_number', 'start_date', 'end_date', 'premium', 'status', 'auto_renew'],
    'fraudflags': ['id', 'claim_id', 'rule_code', 'severity', 'details', 'created_at']
}

print("SCHEMA COMPARISON")
print("=" * 60)

for table_name, expected_cols in expected.items():
    actual_cols = [col['name'] for col in inspector.get_columns(table_name)]
    missing = set(expected_cols) - set(actual_cols)
    extra = set(actual_cols) - set(expected_cols)
    
    print(f"\n{table_name.upper()}:")
    if missing:
        print(f"  MISSING: {', '.join(sorted(missing))}")
    else:
        print("  All expected columns present")
    if extra:
        print(f"  EXTRA: {', '.join(sorted(extra))}")

db.close()
