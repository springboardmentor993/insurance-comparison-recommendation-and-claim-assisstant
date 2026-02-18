from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for i, user in enumerate(users):
            print(f"{i+1}. {user.email} (ID: {user.id})")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
