"""Check existing claims-related table schemas."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
tables = ['claims', 'claimdocuments', 'adminlogs', 'fraudflags', 'userpolicies', 'risk_profiles']

for table in tables:
    if table in insp.get_table_names():
        print(f"\n{'='*60}")
        print(f"{table.upper()} TABLE:")
        print('='*60)
        cols = insp.get_columns(table)
        for col in cols:
            nullable = 'NULL' if col['nullable'] else 'NOT NULL'
            default = f" DEFAULT {col.get('default', '')}" if col.get('default') else ''
            print(f"{col['name']:25} {str(col['type']):20} {nullable}{default}")
