from pydantic import BaseModel, Field
from app.models.user import User


class LoginRequest(BaseModel):
    """Login request model."""
    email: str
    password: str


class Token(BaseModel):
    """JWT token model."""
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Login response model."""
    success: bool = True
    user: User
    token: str


class SignupResponse(BaseModel):
    """Signup response model."""
    success: bool = True
    user: User
    token: str


class LogoutResponse(BaseModel):
    """Logout response model."""
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error: str
