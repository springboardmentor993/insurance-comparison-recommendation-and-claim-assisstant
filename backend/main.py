from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import SignupRequest
from hashing import Hash
from routers import policies, login, risk_profile


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(policies.router)
app.include_router(login.router)
app.include_router(risk_profile.router)


@app.post("/signup")
def signup( request: SignupRequest,db: Session=Depends(get_db)):
    #check email alredy exits
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        return {"message": "Email already registered"}

    hashed_password=Hash.hash_password(request.password)
    # create user object
    new_user=User(
        name=request.name,
        email=request.email,
        password=hashed_password,
        dob=request.dob
    )
    # save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Signup successful",
        "user_id": new_user.id,
        "email": new_user.email
    }
