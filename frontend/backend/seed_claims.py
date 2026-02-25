"""
Seed database with random claims for testing
Run: python seed_claims.py
"""
import random
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import User, Policy, UserPolicy, Claim, ClaimStatus

db = SessionLocal()

try:
    # 1. Get the test user
    user = db.query(User).filter(User.email == "john@example.com").first()
    if not user:
        print("❌ User john@example.com not found. Please run seed_data.py first.")
        exit(1)

    print(f"✅ Found user: {user.name}")

    # 2. Assign a policy to the user (if not already)
    # Get a random policy
    policy = db.query(Policy).first()
    if not policy:
        print("❌ No policies found. Please run seed_data.py first.")
        exit(1)

    # Check if user already has this policy
    user_policy = db.query(UserPolicy).filter(
        UserPolicy.user_id == user.id,
        UserPolicy.policy_id == policy.id
    ).first()

    if not user_policy:
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
        db.commit()
        db.refresh(user_policy)
        print(f"✅ Assigned policy {user_policy.policy_number} to user")
    else:
        print(f"✅ User already has policy {user_policy.policy_number}")


    # 3. Create 3 Claims

    claims_data = [
        {
            "status": ClaimStatus.APPROVED,
            "claim_type": "Medical",
            "amount": 15000.00,
            "description": "Emergency surgery for appendicitis. All documents verified and procedure matches policy coverage. Approved for full amount."
        },
        {
            "status": ClaimStatus.REJECTED,
            "claim_type": "Theft",
            "amount": 45000.00,
            "description": "Claim rejected. Police report indicates negligence (car left unlocked with keys inside). Policy Clause 4.2 excludes coverage for negligence."
        },
        {
            "status": ClaimStatus.SUBMITTED,
            "claim_type": "Accident",
            "amount": 25000.00,
            "description": "Minor collision at intersection. Bumper and headlight damage. awaiting repair estimate verification."
        }
    ]

    for data in claims_data:
        claim_num = f"CLM-{random.randint(100000, 999999)}"
        new_claim = Claim(
            user_policy_id=user_policy.id,
            claim_number=claim_num,
            claim_type=data["claim_type"],
            incident_date=(datetime.now() - timedelta(days=random.randint(1, 60))).date(),
            amount_claimed=data["amount"],
            description=data["description"],
            status=data["status"]
        )
        db.add(new_claim)
        print(f"   - Created {data['status'].value} claim: {claim_num}")

    db.commit()
    print("\n✅ Successfully added 3 seeded claims!")

except Exception as e:
    print(f"❌ Error seeding claims: {e}")
    db.rollback()
finally:
    db.close()
