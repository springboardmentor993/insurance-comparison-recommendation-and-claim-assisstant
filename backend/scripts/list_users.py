"""List all users in the database."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from models.models import User

db = SessionLocal()

print("Users in database:")
print("-" * 60)
users = db.query(User).all()
for user in users:
    print(f"ID: {user.id} | Email: {user.email} | Name: {user.name} | Role: {user.role}")

print(f"\nTotal users: {len(users)}")

db.close()
