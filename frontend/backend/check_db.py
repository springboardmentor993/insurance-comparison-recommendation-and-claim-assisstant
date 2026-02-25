"""
Check database state for users and policies
Run: python check_db.py
"""
from app.database import SessionLocal
from app.models import User, UserPolicy, Policy
from sqlalchemy.orm import joinedload

db = SessionLocal()

import traceback

try:
    with open("db_report.txt", "w") as f:
        f.write("-" * 50 + "\n")
        f.write("🔍 USERS AND POLICIES REPORT\n")
        f.write("-" * 50 + "\n")
        f.flush()

        users = db.query(User).all()
        if not users:
            f.write("❌ No users found in database!\n")
        else:
            for user in users:
                f.write(f"\nUser: {user.name} ({user.email}) [ID: {user.id}]\n")
                
                try:
                    user_policies = db.query(UserPolicy).filter(UserPolicy.user_id == user.id).all()
                    
                    if not user_policies:
                        f.write("   ⚠️ No policies assigned to this user.\n")
                    else:
                        f.write(f"   ✅ Assigned Policies ({len(user_policies)}):\n")
                        for up in user_policies:
                            # Lazy load should work here if session is active
                            policy_title = up.policy.title if up.policy else "Unknown Title"
                            f.write(f"      - [{up.policy_number}] {policy_title} (Status: {up.status})\n")
                except Exception as e:
                    f.write(f"   ❌ Error fetching policies: {str(e)}\n")
                f.flush()

        f.write("-" * 50 + "\n")

        # Check total policies in system
        total_policies = db.query(Policy).count()
        f.write(f"Total Base Policies in System: {total_policies}\n")
        print("Report written to db_report.txt")

except Exception as e:
    with open("db_report.txt", "a") as f:
        f.write(f"\n❌ FATAL ERROR: {str(e)}\n")
        f.write(traceback.format_exc())
    print(f"Error: {e}")
