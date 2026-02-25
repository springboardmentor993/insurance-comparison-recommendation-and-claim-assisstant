"""
Script to check what policies exist in the database
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Policy, PolicyType

def check_policies():
    """Check what policies exist in database"""
    db = SessionLocal()
    try:
        policies = db.query(Policy).all()
        print(f"\n📊 Found {len(policies)} total policies\n")
        
        # Count by type
        health_count = db.query(Policy).filter(Policy.policy_type == PolicyType.HEALTH).count()
        life_count = db.query(Policy).filter(Policy.policy_type == PolicyType.LIFE).count()
        auto_count = db.query(Policy).filter(Policy.policy_type == PolicyType.AUTO).count()
        home_count = db.query(Policy).filter(Policy.policy_type == PolicyType.HOME).count()
        travel_count = db.query(Policy).filter(Policy.policy_type == PolicyType.TRAVEL).count()
        
        print(f"🏥 Health: {health_count}")
        print(f"💰 Life: {life_count}")
        print(f"🚗 Auto/Vehicle: {auto_count}")
        print(f"🏠 Home: {home_count}")
        print(f"✈️  Travel: {travel_count}")
        
        print("\nPolicies by type:")
        for policy in policies:
            print(f"  - {policy.title} ({policy.policy_type})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_policies()
