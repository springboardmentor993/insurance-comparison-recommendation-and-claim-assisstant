from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, UserPolicy, Policy

def check_policies():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "test_claim@example.com").first()
        if not user:
            print("Test user not found")
            return

        print(f"User: {user.email} (ID: {user.id})")
        
        user_policies = db.query(UserPolicy).filter(UserPolicy.user_id == user.id).all()
        if not user_policies:
            print("No policies assigned to this user.")
        else:
            print(f"Found {len(user_policies)} policies:")
            for up in user_policies:
                policy = db.query(Policy).filter(Policy.id == up.policy_id).first()
                title = policy.title if policy else "Unknown"
                print(f" - ID: {up.id}, Policy: {title}, Status: {up.status}")
                
    finally:
        db.close()

if __name__ == "__main__":
    check_policies()
