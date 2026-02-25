"""
Seed database with multiple user policies
Run: python seed_user_policies.py
"""
import random
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import User, Policy, UserPolicy

db = SessionLocal()

try:
    # 1. Get the test user
    user = db.query(User).filter(User.email == "john@example.com").first()
    if not user:
        print("❌ User john@example.com not found. Please run seed_data.py first.")
        exit(1)

    # 2. Get all policies
    all_policies = db.query(Policy).all()
    if not all_policies:
        print("❌ No policies found. Please run seed_data.py first.")
        exit(1)

    print(f"✅ Found {len(all_policies)} available policies in catalog.")

    # 3. Assign 3 random policies
    policies_to_assign = random.sample(all_policies, min(3, len(all_policies)))

    for policy in policies_to_assign:
        # Check if already exists
        exists = db.query(UserPolicy).filter(
            UserPolicy.user_id == user.id,
            UserPolicy.policy_id == policy.id
        ).first()

        if not exists:
            user_policy = UserPolicy(
                user_id=user.id,
                policy_id=policy.id,
                policy_number=f"POL-{random.randint(10000, 99999)}",
                start_date=datetime.now().date(),
                end_date=(datetime.now() + timedelta(days=365)).date(),
                premium=float(policy.premium),
                status="active"
            )
            db.add(user_policy)
            print(f"   - Assigned {policy.title}")
        else:
            print(f"   - Already has {policy.title}")

    db.commit()
    print("\n✅ User policies updated!")

except Exception as e:
    print(f"❌ Error seeding policies: {e}")
    db.rollback()
finally:
    db.close()
