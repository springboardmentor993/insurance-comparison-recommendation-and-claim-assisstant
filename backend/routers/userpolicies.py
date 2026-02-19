from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db
from oauth2 import get_current_user

router = APIRouter(
    prefix="/userpolicies",
    tags=["UserPolicies"]
)


@router.get("/")
def get_user_policies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # current_user is already a User object
    user_policies = db.query(models.UserPolicies).filter(
        models.UserPolicies.user_id == current_user.id
    ).all()

    return user_policies
