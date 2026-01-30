from database import engine, SessionLocal
from sqlalchemy.orm import Session
from models import User, Provider, Policy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()                                                 

User.metadata.create_all(bind=engine)
Provider.metadata.create_all(bind=engine)
Policy.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "PolicyNest Backend is running"}

@app.post("/login")
def login(user: dict):
    db: Session = SessionLocal()

    email = user.get("username")
    password = user.get("password")

    db_user = db.query(User).filter(
        User.email == email,
        User.password == password
    ).first()

    db.close()

    if db_user:
        return {"status": "success"}
    return {"status": "failed"}
from models import Policy
from database import SessionLocal

@app.get("/policies")
def get_policies():
    db = SessionLocal()
    policies = db.query(Policy).all()
    db.close()
    return policies

