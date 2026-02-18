from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from jwt_token import verify_access_token
from deps import get_db
from models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = verify_access_token(token)
        email = payload.get("sub")
        if not email:
            raise ValueError("Missing sub in token")
        return email
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user_email),
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def get_current_user_only(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure the user is a standard user, not an admin.
    Admins should not be filing claims or viewing 'my policies'.
    """
    if current_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot perform this client-side action.",
        )
    return current_user


# Alias for backward compatibility (defaults to standard user check if needed, 
# but for now let's keep get_current_active_user as just get_current_user 
# and explicitly use get_current_user_only for protected routes)
get_current_active_user = get_current_user
