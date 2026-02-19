"""Add policies to a specific user by email."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import SessionLocal
from models.models import User, Policy, UserPolicy

def add_policies_to_user(email: str):
    """Add 3 active policies to a user by their email."""
    db = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ No user found with email: {email}")
            print("\nAvailable users:")
            users = db.query(User).all()
            for u in users:
                print(f"  - {u.email}")
            return False
        
        print(f"Found user: {user.email} (ID: {user.id})")
        
        # Get some policies
        policies = db.query(Policy).limit(3).all()
        
        if not policies:
            print("❌ No policies found in database. Please run seed.py first.")
            return False
        
        print(f"\nAdding {len(policies)} policies to user {user.email}:")
        
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
        
        db.commit()
        
        if added_count > 0:
            print(f"\n✅ Successfully added {added_count} policies!")
        else:
            print(f"\n✅ User already has all policies!")
            
        # Show summary
        total_policies = db.query(UserPolicy).filter(
            UserPolicy.user_id == user.id,
            UserPolicy.status == "active"
        ).count()
        print(f"Total active policies for {user.email}: {total_policies}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_user_policies.py <user_email>")
        print("\nExample:")
        print("  python add_user_policies.py test@example.com")
        sys.exit(1)
    
    user_email = sys.argv[1]
    add_policies_to_user(user_email)
