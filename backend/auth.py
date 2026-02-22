from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import bcrypt

SECRET_KEY = "SECRET123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
ADMIN_EMAIL = "elchuritejaharshini@gmail.com"  # Only this email has admin access
ADMIN_CREDENTIALS = {
    "elchuritejaharshini@gmail.com": "958181630"  # ONLY admin email with credentials - NO OTHER ADMINS
}

# Configure bcrypt for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """Hash password using bcrypt with 10 salt rounds"""
    # Generate bcrypt hash
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str):
    """Verify password against bcrypt hash"""
    try:
        # Compare plain text password with bcrypt hash
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
