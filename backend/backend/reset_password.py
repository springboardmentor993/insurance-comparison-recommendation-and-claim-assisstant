from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from security import hash_password
import sys

def reset_password(email, new_password):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email {email} not found.")
            return

        print(f"Resetting password for {user.name} ({email})...")
        user.password = hash_password(new_password)
        db.commit()
        print("✅ Password reset successfully.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reset_password.py <email> <new_password>")
        print("Example: python reset_password.py varun21@gmail.com password123")
    else:
        reset_password(sys.argv[1], sys.argv[2])
