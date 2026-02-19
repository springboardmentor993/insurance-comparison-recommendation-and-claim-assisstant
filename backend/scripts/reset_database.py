"""Reset database and reseed with enhanced data."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from models.models import Policy, Provider, Recommendation
from scripts.seed import seed_data


def reset_database():
    """Clear all data and reseed with enhanced policies."""
    db = SessionLocal()
    try:
        print("🗑️  Clearing old data...")
        # Delete in correct order (foreign key constraints)
        db.query(Recommendation).delete()
        db.query(Policy).delete()
        db.query(Provider).delete()
        db.commit()
        print("✅ Old data cleared")
        
        print("\n🌱 Seeding new enhanced data...")
        db.close()  # Close before seed_data opens its own session
        seed_data()
        
        print("\n✅ Database reset complete!")
        print("\nYou can now:")
        print("1. Restart the backend server")
        print("2. Visit the frontend to see coverage amounts displaying correctly")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    reset_database()
