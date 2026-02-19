"""Add policies to ALL users in the database."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from models.models import User, Policy, UserPolicy

db = SessionLocal()

print("Adding policies to all users...")
print("=" * 60)

try:
    # Get all users
    users = db.query(User).all()
    
    if not users:
        print("❌ No users found in database.")
        exit(1)
    
    # Get some policies
    policies = db.query(Policy).limit(3).all()
    
    if not policies:
        print("❌ No policies found in database. Please run seed.py first.")
        exit(1)
    
    print(f"Found {len(users)} users and {len(policies)} policies\n")
    
    for user in users:
        print(f"\n👤 User: {user.email} (ID: {user.id})")
        added_count = 0
        
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
                print(f"  ✅ Added: {policy.title}")
                added_count += 1
            else:
                print(f"  ⏭️  Already exists: {policy.title}")
        
        if added_count > 0:
            print(f"  ➡️  Added {added_count} new policies")
        else:
            print(f"  ➡️  Already had all policies")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print("✅ All users now have access to policies!")
    print("\nSummary:")
    for user in users:
        count = db.query(UserPolicy).filter(
            UserPolicy.user_id == user.id,
            UserPolicy.status == "active"
        ).count()
        print(f"  {user.email}: {count} active policies")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
