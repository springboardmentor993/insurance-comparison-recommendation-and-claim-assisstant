# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from database import get_db
# from models import UserPreferences
# from schemas import UserPreferencesCreate
# from dependencies import get_current_user

# router = APIRouter()

# @router.post("/preferences")
# def save_user_preferences(
#     data: UserPreferencesCreate,
#     db: Session = Depends(get_db),
#     current_user = Depends(get_current_user)
# ):
#     prefs = db.query(UserPreferences).filter(
#         UserPreferences.user_id == current_user.id
#     ).first()

#     if prefs:
#         for k, v in data.dict().items():
#             setattr(prefs, k, v)
#     else:
#         prefs = UserPreferences(
#             user_id=current_user.id,
#             **data.dict()
#         )
#         db.add(prefs)

#     db.commit()
#     return {"message": "Preferences saved"}
