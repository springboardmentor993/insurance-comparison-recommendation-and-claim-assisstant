from passlib.context import CryptContext

pwd_cxt = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Hash:
    def hash_password(password: str):
        return pwd_cxt.hash(password)

class Verify:
    def verify_password(plain_password: str, hashed_password: str):
        return pwd_cxt.verify(plain_password, hashed_password)