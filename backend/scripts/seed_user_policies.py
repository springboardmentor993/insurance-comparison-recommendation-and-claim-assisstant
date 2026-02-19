"""Seed some test user policies for claims testing."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from models.models import User, Policy, UserPolicy
from datetime import datetime

db = SessionLocal()

# Get first user
user = db.query(User).first()
if not user:
    print("No users found. Please register a user first.")
    exit()

# Get some policies
policies = db.query(Policy).limit(3).all()

print(f"Creating user policies for user: {user.email}")

for policy in policies:
    # Check if user_policy already exists
    existing = db.query(UserPolicy).filter(
        UserPolicy.user_id == user.id,
        UserPolicy.policy_id == policy.id
    ).first()
    
    if not existing:
        user_policy = UserPolicy(
            user_id=user.id,
            policy_id=policy.id,
            status="active"
        )
        db.add(user_policy)
        print(f"✅ Added: {policy.title}")
    else:
        print(f"⏭️  Already exists: {policy.title}")

db.commit()
print("\n✅ User policies created successfully!")
print(f"Total user policies: {db.query(UserPolicy).count()}")

db.close()
