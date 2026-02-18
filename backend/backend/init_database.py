"""
Initialize the complete database schema for Insurenz.
Creates all tables and seeds initial data.
"""
from sqlalchemy import inspect
from database import engine, Base, SessionLocal
from models import (
    User, Provider, Policy, UserPolicy,
    Recommendation, Claim, ClaimDocument
)
from seed import seed_data


def init_db():
    """
    Create all tables and seed initial data.
    """
    print("🔧 Initializing Insurenz Database...")
    print(f"Database: insurenz.db")
    print()
    
    # Create all tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Verify tables were created
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"✅ Created {len(tables)} tables:")
    for table in tables:
        print(f"   - {table}")
    
    print()
    
    # Seed initial data
    print("Seeding initial data...")
    seed_data()
    
    # Verify seeding
    db = SessionLocal()
    try:
        provider_count = db.query(Provider).count()
        policy_count = db.query(Policy).count()
        
        print(f"✅ Seeded:")
        print(f"   - {provider_count} providers")
        print(f"   - {policy_count} policies")
    finally:
        db.close()
    
    print()
    print("🎉 Database initialization complete!")
    print()
    print("You can now:")
    print("  1. Start the backend: python -m uvicorn main:app --reload")
    print("  2. Register users via API")
    print("  3. Browse policies and file claims")


if __name__ == "__main__":
    init_db()
