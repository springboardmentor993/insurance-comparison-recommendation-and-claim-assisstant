"""
Script to create a default admin user with bcrypt password hashing.
Run this after updating the User model with the role column.

Usage:
    python -m backend.create_admin_user

This will:
1. Check if the 'role' column exists; add it if not
2. Create an admin user with email 'elchuritejaharshini@gmail.com'
3. Hash the password using bcrypt
4. Store the admin user in the database
"""

from backend.database import engine, SessionLocal
from backend import models
from backend.auth import hash_password
from sqlalchemy import text, inspect
import sys

def add_role_column_if_missing():
    """Add role column to users table if it doesn't exist"""
    print("Checking for 'role' column in users table...")
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = {col['name'] for col in inspector.get_columns('users')}
        
        if 'role' in columns:
            print("  ✓ 'role' column already exists")
            return True
        
        print("  - Adding 'role' column...")
        try:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL
            """))
            conn.commit()
            print("  ✓ 'role' column added successfully")
            return True
        except Exception as e:
            print(f"  ✗ Error adding role column: {e}")
            return False

def create_admin_user():
    """Create default admin user"""
    print("\nCreating default admin user...")
    
    db = SessionLocal()
    try:
        admin_email = "elchuritejaharshini@gmail.com"
        admin_password = "958181630"
        
        # Check if admin already exists
        existing_admin = db.query(models.User).filter(
            models.User.email == admin_email
        ).first()
        
        if existing_admin:
            print(f"  ⚠ Admin user '{admin_email}' already exists")
            print(f"    ID: {existing_admin.id}")
            print(f"    Role: {existing_admin.role}")
            
            # Update role if not admin
            if existing_admin.role != 'admin':
                existing_admin.role = 'admin'
                existing_admin.is_admin = True
                db.commit()
                print(f"  ✓ Updated to admin role")
            return True
        
        # Hash password using bcrypt
        hashed_password = hash_password(admin_password)
        print(f"  - Password hashed with bcrypt: {hashed_password[:20]}...")
        
        # Create admin user
        admin_user = models.User(
            name="Admin",
            email=admin_email,
            password=hashed_password,
            role='admin',
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"  ✓ Admin user created successfully!")
        print(f"    ID: {admin_user.id}")
        print(f"    Email: {admin_user.email}")
        print(f"    Role: {admin_user.role}")
        print(f"    Is Admin: {admin_user.is_admin}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def verify_admin_user():
    """Verify admin user exists and has correct role"""
    print("\nVerifying admin user...")
    
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(
            models.User.email == "elchuritejaharshini@gmail.com"
        ).first()
        
        if admin_user:
            print(f"  ✓ Admin user exists")
            print(f"    Email: {admin_user.email}")
            print(f"    Role: {admin_user.role}")
            print(f"    Is Admin: {admin_user.is_admin}")
            
            if admin_user.role == 'admin':
                print(f"  ✓ Admin role verified")
                return True
            else:
                print(f"  ✗ Admin role NOT set correctly")
                return False
        else:
            print(f"  ✗ Admin user NOT found")
            return False
            
    except Exception as e:
        print(f"  ✗ Error verifying admin: {e}")
        return False
    finally:
        db.close()

def main():
    """Main entry point"""
    print("="*70)
    print("ADMIN USER SETUP SCRIPT")
    print("="*70)
    
    # Step 1: Add role column if missing
    if not add_role_column_if_missing():
        print("\n✗ Failed to add role column")
        sys.exit(1)
    
    # Step 2: Create admin user
    if not create_admin_user():
        print("\n✗ Failed to create admin user")
        sys.exit(1)
    
    # Step 3: Verify admin user
    if not verify_admin_user():
        print("\n✗ Admin verification failed")
        sys.exit(1)
    
    print("\n" + "="*70)
    print("✅ ADMIN USER SETUP COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\nAdmin Login Credentials:")
    print(f"  Email: elchuritejaharshini@gmail.com")
    print(f"  Password: 958181630")
    print(f"\nUse these credentials to login and access the admin portal at /admin/dashboard")

if __name__ == "__main__":
    main()
