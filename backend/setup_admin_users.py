"""
Script to create admin users for testing.
Creates both email-based and username-based admin accounts.

Usage:
    python -m backend.setup_admin_users
"""

from backend.database import engine, SessionLocal
from backend import models
from backend.auth import hash_password, ADMIN_CREDENTIALS
from sqlalchemy import inspect
import sys

def add_role_column_if_missing():
    """Add role and is_admin columns to users table if they don't exist"""
    print("Checking for required columns in users table...")
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = {col['name'] for col in inspector.get_columns('users')}
        
        # Check and add role column
        if 'role' not in columns:
            print("  - Adding 'role' column...")
            try:
                conn.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL")
                conn.commit()
                print("  ✓ 'role' column added")
            except Exception as e:
                print(f"  ⚠ 'role' column error: {e}")
        else:
            print("  ✓ 'role' column exists")
        
        # Check and add is_admin column
        if 'is_admin' not in columns:
            print("  - Adding 'is_admin' column...")
            try:
                conn.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
                conn.commit()
                print("  ✓ 'is_admin' column added")
            except Exception as e:
                print(f"  ⚠ 'is_admin' column error: {e}")
        else:
            print("  ✓ 'is_admin' column exists")

def create_admin_user(email, password, name="Admin"):
    """Create or update an admin user"""
    print(f"\n  Setting up admin user: {email}")
    
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            models.User.email == email
        ).first()
        
        if existing_user:
            print(f"    - User exists, updating admin status...")
            # Update to admin
            existing_user.is_admin = True
            existing_user.role = 'admin'
            db.commit()
            db.refresh(existing_user)
            print(f"    ✓ Updated user to admin: {email}")
            return True
        
        # Create new admin user
        print(f"    - Creating new admin user...")
        hashed_password = hash_password(password)
        
        admin_user = models.User(
            name=name,
            email=email,
            password=hashed_password,
            role='admin',
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"    ✓ Created admin user: {email}")
        return True
        
    except Exception as e:
        print(f"    ✗ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("="*70)
    print("ADMIN USERS SETUP")
    print("="*70)
    
    # Step 1: Add columns
    add_role_column_if_missing()
    
    # Step 2: Create admin users from ADMIN_CREDENTIALS
    print("\nCreating admin users from ADMIN_CREDENTIALS...")
    all_success = True
    
    for email, password in ADMIN_CREDENTIALS.items():
        success = create_admin_user(email, password)
        if not success:
            all_success = False
    
    # Summary
    print("\n" + "="*70)
    if all_success:
        print("✅ ADMIN SETUP COMPLETED SUCCESSFULLY!")
        print("="*70)
        print("\nYou can now login with any of these credentials:")
        for email, password in ADMIN_CREDENTIALS.items():
            print(f"  Email: {email}")
            print(f"  Password: {password}")
            print()
    else:
        print("⚠ SETUP COMPLETED WITH ERRORS")
        sys.exit(1)

if __name__ == "__main__":
    main()
