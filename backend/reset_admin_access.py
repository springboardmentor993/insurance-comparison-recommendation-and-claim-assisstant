#!/usr/bin/env python3
"""
Reset admin access - ensure ONLY elchuritejaharshini@gmail.com has admin role
Remove admin access from all other users
"""

from backend.database import SessionLocal
from backend import models

ADMIN_EMAIL = "elchuritejaharshini@gmail.com"

def reset_admin_access():
    """Reset admin access - only ADMIN_EMAIL should be admin"""
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("RESETTING ADMIN ACCESS")
        print("=" * 70)
        
        # Find the authorized admin user
        admin_user = db.query(models.User).filter(
            models.User.email == ADMIN_EMAIL
        ).first()
        
        if not admin_user:
            print(f"\n✗ Admin user '{ADMIN_EMAIL}' not found in database")
            print(f"  Please create this user first")
            return False
        
        print(f"\n✓ Found authorized admin: {admin_user.email}")
        
        # Get all users who currently have admin access
        admin_users = db.query(models.User).filter(
            models.User.is_admin == True
        ).all()
        
        print(f"\nCurrent admin users ({len(admin_users)}):")
        for user in admin_users:
            print(f"  - {user.email} (ID: {user.id})")
        
        # Reset all non-authorized users to user role
        print(f"\n" + "-" * 70)
        print("UPDATING USER ROLES...")
        print("-" * 70)
        
        updated_count = 0
        for user in admin_users:
            if user.email != ADMIN_EMAIL:
                print(f"\n  Removing admin access from: {user.email}")
                user.role = models.UserRoleEnum.user
                user.is_admin = False
                db.commit()
                updated_count += 1
                print(f"    ✓ Updated to user role")
        
        # Ensure authorized admin has admin role
        if admin_user.role != models.UserRoleEnum.admin or not admin_user.is_admin:
            print(f"\n  Setting admin role for: {admin_user.email}")
            admin_user.role = models.UserRoleEnum.admin
            admin_user.is_admin = True
            db.commit()
            updated_count += 1
            print(f"    ✓ Updated to admin role")
        
        print(f"\n" + "=" * 70)
        print(f"SUMMARY")
        print("=" * 70)
        print(f"✓ Admin access updated")
        print(f"  - Updated {updated_count} user(s)")
        print(f"  - Authorized admin: {ADMIN_EMAIL}")
        
        # List final state
        all_admins = db.query(models.User).filter(
            models.User.is_admin == True
        ).all()
        
        print(f"\nFinal admin users ({len(all_admins)}):")
        for user in all_admins:
            print(f"  ✓ {user.email} (Role: {user.role})")
        
        if len(all_admins) == 1 and all_admins[0].email == ADMIN_EMAIL:
            print(f"\n✓ SUCCESS: Only {ADMIN_EMAIL} has admin access!")
        else:
            print(f"\n✗ ERROR: Unexpected admin users found!")
            return False
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during admin access reset: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = reset_admin_access()
    exit(0 if success else 1)
