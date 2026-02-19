"""Check database schema."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import engine
from sqlalchemy import inspect

insp = inspect(engine)

print("=" * 60)
print("POLICIES TABLE SCHEMA:")
print("=" * 60)
cols = insp.get_columns('policies')
for col in cols:
    print(f"{col['name']:30} {str(col['type']):20} {'NULL' if col['nullable'] else 'NOT NULL'}")

print("\n" + "=" * 60)
print("PROVIDERS TABLE SCHEMA:")
print("=" * 60)
cols = insp.get_columns('providers')
for col in cols:
    print(f"{col['name']:30} {str(col['type']):20} {'NULL' if col['nullable'] else 'NOT NULL'}")
