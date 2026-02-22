#!/usr/bin/env python3
"""
Seed script to populate database with realistic insurance policies
Loads from policies_seed_data.json
"""
import json
import sys
sys.path.insert(0, '.')

from backend.database import engine, SessionLocal
from backend import models
from datetime import datetime

def load_seed_data(json_file='policies_seed_data.json'):
    """Load policies from JSON seed file"""
    with open(json_file, 'r') as f:
        data = json.load(f)
    return data

def seed_database():
    """Populate database with seed data"""
    print("🌱 Loading seed data...")
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Load seed data
        seed_data = load_seed_data()
        
        # Check if data already exists
        existing_count = db.query(models.Policy).count()
        if existing_count > 0:
            print(f"✓ Database already has {existing_count} policies. Skipping seed...")
            return
        
        # Add providers
        print(f"  Adding {len(seed_data['providers'])} providers...")
        providers_map = {}
        for provider_data in seed_data['providers']:
            provider = models.Provider(
                name=provider_data['name'],
                country=provider_data['country']
            )
            db.add(provider)
            db.flush()
            providers_map[provider_data['id']] = provider.id
        
        print(f"  Adding {len(seed_data['policies'])} policies...")
        
        # Add policies
        for policy_data in seed_data['policies']:
            policy = models.Policy(
                title=policy_data['title'],
                policy_type=policy_data['policy_type'],
                provider_id=providers_map[policy_data['provider_id']],
                premium=policy_data['premium'],
                term_months=policy_data['term_months'],
                coverage=policy_data['coverage'],
                deductible=100.00  # Default deductible
            )
            db.add(policy)
        
        db.commit()
        print(f"✅ Successfully seeded database!")
        print(f"   ✓ Providers: {len(seed_data['providers'])}")
        print(f"   ✓ Policies: {len(seed_data['policies'])}")
        
        # Show policy type breakdown
        breakdown = {}
        for policy in seed_data['policies']:
            policy_type = policy['policy_type']
            breakdown[policy_type] = breakdown.get(policy_type, 0) + 1
        
        print("\n📊 Policy Type Breakdown:")
        for ptype, count in sorted(breakdown.items()):
            print(f"   • {ptype.upper()}: {count} policies")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == '__main__':
    seed_database()
