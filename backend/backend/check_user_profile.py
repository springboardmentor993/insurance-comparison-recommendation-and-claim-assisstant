from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
import json

def check_profile():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "test_claim@example.com").first()
        if user:
            print(f"User: {user.email}")
            print(f"Risk Profile: {user.risk_profile}")
        else:
            print("Test user not found")
    finally:
        db.close()

if __name__ == "__main__":
    check_profile()
