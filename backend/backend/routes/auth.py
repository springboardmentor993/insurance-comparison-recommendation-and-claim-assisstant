from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas import UserCreate, UserLogin
from models import User
from deps import get_db
from security import hash_password, verify_password
from jwt_token import create_access_token

router = APIRouter()

# ---------------- REGISTER ----------------
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # 1) Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # 2) Hash password
    hashed_password = hash_password(user.password)

    # 3) Create user object (matches DB table columns)
    new_user = User(
        name=user.name if user.name else "User",
        email=user.email,
        password=hashed_password,
        dob=user.dob,
    )

    # 4) Save to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

# ---------------- LOGIN ----------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # 1) Fetch user from DB
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 2) Validate credentials
    is_valid = verify_password(user.password, db_user.password)
    print(f"DEBUG: Password check for {user.email}: {is_valid}")
    
    if not is_valid:
        print(f"DEBUG: Password mismatch for {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3) Generate JWT
    token = create_access_token({"sub": db_user.email})

    return {"access_token": token, "token_type": "bearer"}
