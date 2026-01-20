from fastapi import APIRouter,Depends
from schemas import LoginRequest
from  models import User
from sqlalchemy.orm import Session
from database import get_db
from hashing import Verify
from jwt_token import create_access_token
router=APIRouter()

@router.post("/login")
def login(request: LoginRequest, db: Session=Depends(get_db)):
    user=db.query(User).filter(User.email==request.email).first()
    if not user:
        return {"message":"Invalid email or password"}
    is_valid = Verify.verify_password(request.password, user.password)
    if not is_valid:
        return {"message":"Invalid email or password"}

    access_token = create_access_token(
        data={"sub": user.email}
        )

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user_id": user.id,
    "email": user.email
}
