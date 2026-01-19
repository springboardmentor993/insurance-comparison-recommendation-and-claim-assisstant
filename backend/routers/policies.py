from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import Policy
from database import get_db

router = APIRouter()
# get_db= database.get_db

@router.get("/policies")

def get_policies(db:Session=Depends(get_db)):
    policies = db.query(Policy).all()
    return policies