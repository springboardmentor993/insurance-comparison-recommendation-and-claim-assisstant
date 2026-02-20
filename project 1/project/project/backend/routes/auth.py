from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from schemas import UserCreate, UserLogin
from models import User
from deps import get_db
from security import hash_password, verify_password
from jwt_token import create_access_token

router = APIRouter()

# ---------------- REGISTER ----------------
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # 1. Check if email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # 2. Hash password
        hashed_password = hash_password(user.password)

        # 3. Create user object (matches table)
        new_user = User(
            name=user.name,         
            email=user.email,       
            password=hashed_password,
            dob=user.dob,
            income=user.income,
            budget=user.budget,
            preferred_policy_type=user.preferred_policy_type
        )

        # 4. Save to PostgreSQL (insurance_db)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "User registered successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# ---------------- LOGIN ----------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # 1. Fetch user from DB
    db_user = db.query(User).filter(User.email == user.email).first()

    # 2. Validate credentials
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. Generate JWT
    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
