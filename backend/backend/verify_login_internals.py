from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from security import verify_password
from jwt_token import create_access_token
import sys

def test_login_internals():
    db = SessionLocal()
    email = "varun21@gmail.com"
    password = "password123"
    
    print(f"Testing login for {email}...")
    
    try:
        # 1. Test DB Connection
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("❌ User not found in database!")
            return
        print(f"✅ User found: {user.name} (ID: {user.id})")
        
        # 2. Test Password Verification
        print("Verifying password...")
        is_valid = verify_password(password, user.password)
        if not is_valid:
            print("❌ Password verification failed!")
            print(f"Stored hash: {user.password}")
            return
        print("✅ Password verified.")
        
        # 3. Test JWT Token Creation
        print("Creating access token...")
        token = create_access_token({"sub": user.email})
        print(f"✅ Token created successfully: {token[:20]}...")
        
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_login_internals()
