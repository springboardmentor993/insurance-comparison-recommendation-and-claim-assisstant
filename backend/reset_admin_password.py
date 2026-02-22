#!/usr/bin/env python3
"""
Reset admin user password with proper bcrypt hashing
"""

from backend.database import SessionLocal
from backend import models
from backend.auth import hash_password
import sys

def update_admin_password():
    """Update admin user password with bcrypt"""
    db = SessionLocal()
    
    try:
        admin_email = "elchuritejaharshini@gmail.com"
        admin_password = "958181630"
        
        print("=" * 70)
        print("RESETTING ADMIN PASSWORD WITH BCRYPT")
        print("=" * 70)
        
        # Find admin user
        admin = db.query(models.User).filter(
            models.User.email == admin_email
        ).first()
        
        if not admin:
            print(f"✗ Admin user '{admin_email}' not found")
            return False
        
        print(f"\nFound admin user: {admin.email} (ID: {admin.id})")
        
        # Hash password with bcrypt
        print(f"\nHashing password with bcrypt (10 salt rounds)...")
        hashed_password = hash_password(admin_password)
        print(f"✓ Password hashed successfully")
        print(f"  Hash (first 30 chars): {hashed_password[:30]}...")
        
        # Update password
        print(f"\nUpdating password in database...")
        admin.password = hashed_password
        db.commit()
        print(f"✓ Password updated successfully")
        
        # Verify
        print(f"\nVerifying password...")
        from backend.auth import verify_password
        if verify_password(admin_password, admin.password):
            print(f"✓ Password verification successful!")
        else:
            print(f"✗ Password verification failed!")
            return False
        
        print("\n" + "=" * 70)
        print("✅ ADMIN PASSWORD RESET SUCCESSFULLY!")
        print("=" * 70)
        print(f"\nAdmin Login Credentials:")
        print(f"  Email: {admin_email}")
        print(f"  Password: {admin_password}")
        print(f"\nYou can now login to the admin portal!")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = update_admin_password()
    sys.exit(0 if success else 1)
