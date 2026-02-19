"""Simple script to clear database with SQL and reseed."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import engine
from sqlalchemy import text

print("🗑️  Clearing database...")

with engine.begin() as conn:
    conn.execute(text("DELETE FROM recommendations"))
    conn.execute(text("DELETE FROM policies"))
    conn.execute(text("DELETE FROM providers"))
    
print("✅ Database cleared!")
print("\n🌱 Now run: python -c \"from scripts.seed import seed_data; seed_data()\"")
