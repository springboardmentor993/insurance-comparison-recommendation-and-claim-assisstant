from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import Policy
from sqlalchemy.orm import Session,relationship
from database import engine, SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.post("/login")
def login():
    return {"message": "Login API working"}


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@app.post("/signup")
def signup(user: SignupRequest):
    print(user)
    return {
        "message": "Signup data received",
        "name": user.name,
        "email": user.email
    }


@app.get("/policies")
def get_policies(db:Session=Depends(get_db)):
    policies = db.query(Policy).all()
    return policies