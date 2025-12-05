"""Authentication service for JWT token handling and password hashing."""
from datetime import datetime, timedelta, UTC
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.config import settings
from app.models.user import UserInDB
from app.database.mock_db import db


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """Decode a JWT token and return the user ID."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None


def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Authenticate a user by email and password."""
    user = db.get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(username: str, email: str, password: str, avatar: str) -> Optional[UserInDB]:
    """Create a new user."""
    # Check if email already exists
    if db.get_user_by_email(email):
        return None
    
    # Check if username already exists
    if db.get_user_by_username(username):
        return None
    
    # Create user
    hashed_password = get_password_hash(password)
    user = UserInDB(
        id="",  # Will be set by database
        username=username,
        email=email,
        avatar=avatar,
        hashed_password=hashed_password,
        high_score=0,
        games_played=0,
        created_at=datetime.now(UTC),
    )
    
    return db.create_user(user)
