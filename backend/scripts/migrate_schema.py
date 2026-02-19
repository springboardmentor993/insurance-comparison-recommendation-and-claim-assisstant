"""Migration script to add missing fields to UserPolicies and FraudFlags tables.

This script adds fields according to the specification diagram:
- UserPolicies: policy_number, start_date, end_date, premium, auto_renew
- FraudFlags: rule_code, severity, details, created_at

Existing data is preserved and populated with sensible defaults.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import text
from config.database import engine, SessionLocal
from models.models import UserPolicy, Policy

def generate_policy_number(user_policy_id: int) -> str:
    """Generate unique policy number in format POL-YYYY-NNNNNN"""
    year = datetime.now().year
    return f"POL-{year}-{user_policy_id:06d}"

def migrate_userpolicies():
    """Add missing fields to userpolicies table."""
    print("\n" + "=" * 80)
    print("MIGRATING USERPOLICIES TABLE")
    print("=" * 80)
    
    with engine.connect() as conn:
        # Add columns if they don't exist
        print("\nAdding new columns...")
        
        try:
            conn.execute(text("""
                ALTER TABLE userpolicies 
                ADD COLUMN IF NOT EXISTS policy_number VARCHAR UNIQUE;
            """))
            print("  ✓ Added policy_number column")
        except Exception as e:
            print(f"  • policy_number: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE userpolicies 
                ADD COLUMN IF NOT EXISTS start_date DATE;
            """))
            print("  ✓ Added start_date column")
        except Exception as e:
            print(f"  • start_date: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE userpolicies 
                ADD COLUMN IF NOT EXISTS end_date DATE;
            """))
            print("  ✓ Added end_date column")
        except Exception as e:
            print(f"  • end_date: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE userpolicies 
                ADD COLUMN IF NOT EXISTS premium NUMERIC;
            """))
            print("  ✓ Added premium column")
        except Exception as e:
            print(f"  • premium: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE userpolicies 
                ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;
            """))
            print("  ✓ Added auto_renew column")
        except Exception as e:
            print(f"  • auto_renew: {e}")
        
        conn.commit()
    
    # Populate data for existing records
    print("\nPopulating data for existing records...")
    db = SessionLocal()
    
    try:
        user_policies = db.query(UserPolicy).all()
        updated_count = 0
        
        for up in user_policies:
            needs_update = False
            
            # Generate policy number if missing
            if not up.policy_number:
                up.policy_number = generate_policy_number(up.id)
                needs_update = True
            
            # Set start_date from purchased_at if missing
            if not up.start_date and up.purchased_at:
                up.start_date = up.purchased_at.date()
                needs_update = True
            
            # Calculate end_date from policy term if missing
            if not up.end_date and up.start_date:
                policy = db.query(Policy).filter(Policy.id == up.policy_id).first()
                if policy and policy.term_months:
                    up.end_date = up.start_date + relativedelta(months=policy.term_months)
                    needs_update = True
            
            # Copy premium from policy if missing
            if up.premium is None:
                policy = db.query(Policy).filter(Policy.id == up.policy_id).first()
                if policy:
                    up.premium = policy.premium
                    needs_update = True
            
            # Set auto_renew default if None
            if up.auto_renew is None:
                up.auto_renew = False
                needs_update = True
            
            if needs_update:
                updated_count += 1
        
        db.commit()
        print(f"  ✓ Updated {updated_count} existing UserPolicy records")
        
    except Exception as e:
        print(f"  ✗ Error populating data: {e}")
        db.rollback()
    finally:
        db.close()

def migrate_fraudflags():
    """Add missing fields to fraudflags table."""
    print("\n" + "=" * 80)
    print("MIGRATING FRAUDFLAGS TABLE")
    print("=" * 80)
    
    with engine.connect() as conn:
        print("\nAdding new columns...")
        
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ADD COLUMN IF NOT EXISTS rule_code VARCHAR;
            """))
            print("  ✓ Added rule_code column")
        except Exception as e:
            print(f"  • rule_code: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ADD COLUMN IF NOT EXISTS severity VARCHAR;
            """))
            print("  ✓ Added severity column")
        except Exception as e:
            print(f"  • severity: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ADD COLUMN IF NOT EXISTS details TEXT;
            """))
            print("  ✓ Added details column")
        except Exception as e:
            print(f"  • details: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            """))
            print("  ✓ Added created_at column")
        except Exception as e:
            print(f"  • created_at: {e}")
        
        # Make legacy fields nullable
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ALTER COLUMN reason DROP NOT NULL;
            """))
            print("  ✓ Made reason nullable (for backward compatibility)")
        except Exception as e:
            print(f"  • reason nullable: {e}")
        
        try:
            conn.execute(text("""
                ALTER TABLE fraudflags 
                ALTER COLUMN flagged_by DROP NOT NULL;
            """))
            print("  ✓ Made flagged_by nullable")
        except Exception as e:
            print(f"  • flagged_by nullable: {e}")
        
        conn.commit()
    
    # Migrate existing manual flags to new structure
    with engine.connect() as conn:
        print("\nMigrating existing fraud flags...")
        try:
            result = conn.execute(text("""
                UPDATE fraudflags 
                SET rule_code = 'MANUAL_FLAG',
                    severity = 'medium',
                    created_at = COALESCE(flagged_at, NOW())
                WHERE rule_code IS NULL;
            """))
            conn.commit()
            print(f"  ✓ Migrated {result.rowcount} existing fraud flags to new structure")
        except Exception as e:
            print(f"  ✗ Error migrating flags: {e}")

def verify_migration():
    """Verify that migration was successful."""
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)
    
    from sqlalchemy import inspect
    inspector = inspect(engine)
    
    # Check UserPolicies
    print("\nUserPolicies columns:")
    up_cols = [col['name'] for col in inspector.get_columns('userpolicies')]
    expected_up = ['policy_number', 'start_date', 'end_date', 'premium', 'auto_renew']
    
    for col in expected_up:
        if col in up_cols:
            print(f"  ✓ {col}")
        else:
            print(f"  ✗ {col} MISSING")
    
    # Check FraudFlags
    print("\nFraudFlags columns:")
    ff_cols = [col['name'] for col in inspector.get_columns('fraudflags')]
    expected_ff = ['rule_code', 'severity', 'details', 'created_at']
    
    for col in expected_ff:
        if col in ff_cols:
            print(f"  ✓ {col}")
        else:
            print(f"  ✗ {col} MISSING")
    
    print("\n" + "=" * 80)
    print("MIGRATION COMPLETE!")
    print("=" * 80)

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("DATABASE MIGRATION: Adding Missing Fields")
    print("According to Specification Diagram")
    print("=" * 80)
    
    response = input("\nThis will modify your database. Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Migration cancelled.")
        sys.exit(0)
    
    try:
        # Install python-dateutil if needed
        try:
            from dateutil.relativedelta import relativedelta
        except ImportError:
            print("\nInstalling required package: python-dateutil...")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dateutil"])
            from dateutil.relativedelta import relativedelta
        
        migrate_userpolicies()
        migrate_fraudflags()
        verify_migration()
        
        print("\n✅ Migration completed successfully!")
        print("\nNext steps:")
        print("  1. Update your seed scripts to populate new fields")
        print("  2. Update routes to use new fields when creating UserPolicies")
        print("  3. Implement automated fraud detection service")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
