from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import Policy
from database import get_db
from oauth2 import get_current_user

router = APIRouter()
# get_db= database.get_db


@router.get("/policies")
def get_policies(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    policies = db.query(Policy).all()
    return policies