"""
Script to clear all recommendations from the database.
Run this to force regeneration of recommendations with new filtering logic.
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Recommendation

def clear_all_recommendations():
    """Clear all recommendations from database"""
    db = SessionLocal()
    try:
        count = db.query(Recommendation).delete()
        db.commit()
        print(f"✅ Cleared {count} recommendations from database")
        print("Next time users visit /recommendations, they will be regenerated with new filtering logic")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Clearing all recommendations...")
    clear_all_recommendations()
