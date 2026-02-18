"""
Create recommendations table in the database.
Run this script once to add the recommendations table.
"""
from database import engine
from models import Base, Recommendation

def create_recommendations_table():
    """Create the recommendations table if it doesn't exist."""
    print("Creating recommendations table...")
    
    # Create only the recommendations table
    Recommendation.__table__.create(bind=engine, checkfirst=True)
    
    print("✅ Recommendations table created successfully!")

if __name__ == "__main__":
    create_recommendations_table()
