from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, UserPolicy, Policy
from schemas import UserPolicyOut
import json

def verify_response():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "test_claim@example.com").first()
        if not user:
            print("Test user 'test_claim@example.com' not found.")
            all_users = db.query(User).all()
            print(f"Total users found: {len(all_users)}")
            for u in all_users:
                print(f" - {u.email} (ID: {u.id})")
            
            # Use the first user if available
            if all_users:
                user = all_users[0]
                print(f"Using user: {user.email}")
            else:
                return

        policies = (
            db.query(UserPolicy)
            .join(Policy, Policy.id == UserPolicy.policy_id)
            .filter(UserPolicy.user_id == user.id)
            .all()
        )

        print(f"Found {len(policies)} policies in DB.")

        results = []
        for up in policies:
            coverage_data = {}
            if up.policy and up.policy.coverage:
                 if isinstance(up.policy.coverage, str):
                    try:
                        coverage_data = json.loads(up.policy.coverage)
                    except:
                        coverage_data = {"raw": up.policy.coverage}
                 else:
                    coverage_data = up.policy.coverage
            
            policy_data = None
            if up.policy:
                policy_data = {
                    "id": up.policy.id,
                    "title": up.policy.title,
                    "provider": up.policy.provider.name if up.policy.provider else "Unknown",
                    "provider_name": up.policy.provider.name if up.policy.provider else "Unknown",
                    "premium": float(up.policy.premium),
                    "coverage": coverage_data,
                    "policy_type": up.policy.policy_type.value if hasattr(up.policy.policy_type, "value") else up.policy.policy_type,
                    "term_months": up.policy.term_months,
                    "deductible": float(up.policy.deductible) if up.policy.deductible else None
                }

            item = {
                "id": up.id,
                "user_id": up.user_id,
                "policy_id": up.policy_id,
                "policy_number": up.policy_number,
                "start_date": up.start_date,
                "end_date": up.end_date,
                "premium": float(up.premium),
                "status": up.status.value if hasattr(up.status, "value") else up.status,
                "auto_renew": up.auto_renew,
                "policy": policy_data
            }
            results.append(item)

        print("Validating against UserPolicyOut schema...")
        for item in results:
            try:
                validated = UserPolicyOut(**item)
                print(f"Policy {validated.policy_number} validated successfully.")
                print(f" - Title: {validated.policy.title}")
                print(f" - Provider: {validated.policy.provider}")
            except Exception as e:
                print(f"Validation FAILED for claim {item.get('policy_number')}: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    verify_response()
