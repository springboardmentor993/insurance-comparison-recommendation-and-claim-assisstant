"""Recreate database from scratch using SQLAlchemy models."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import engine, Base
from sqlalchemy import text
from models.models import Provider, Policy, Recommendation, User, UserPolicy, Claim, ClaimDocument, AdminLog, FraudFlag
from scripts.seed import seed_data

print("🔄 Dropping all tables and types...")
with engine.begin() as conn:
    # Drop ENUM types first if they exist
    conn.execute(text("DROP TYPE IF EXISTS policy_category CASCADE"))
    conn.execute(text("DROP TYPE IF EXISTS user_role CASCADE"))
    
    # Drop tables (reverse order of dependencies)
    conn.execute(text("DROP TABLE IF EXISTS fraudflags CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS adminlogs CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS claimdocuments CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS claims CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS userpolicies CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS recommendations CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS policies CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS providers CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))

print("✨ Creating all tables from models...")
Base.metadata.create_all(bind=engine)

print("✅ Database schema created!\n")

print("🌱 Seeding data...")
seed_data()

print("\n✅ Complete! Database ready with enhanced policy data.")
