from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Policy, UserPolicy
from datetime import date, timedelta
import random

def assign_policy():
    db = SessionLocal()
    try:
        email = "varun21@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found!")
            return

        policy = db.query(Policy).first()
        if not policy:
            print("No policies found in DB!")
            return

        # Check if already has this policy
        existing = db.query(UserPolicy).filter(
            UserPolicy.user_id == user.id,
            UserPolicy.policy_id == policy.id
        ).first()

        if existing:
            print(f"User already has policy {policy.title}")
            return

        print(f"Assigning policy '{policy.title}' to {user.name} ({user.email})...")
        
        user_policy = UserPolicy(
            user_id=user.id,
            policy_id=policy.id,
            policy_number=f"POL-{user.id}-{policy.id}-{random.randint(1000,9999)}",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            premium=policy.premium,
            status="active",
            auto_renew=False
        )
        
        db.add(user_policy)
        db.commit()
        print("Policy assigned successfully!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    assign_policy()
