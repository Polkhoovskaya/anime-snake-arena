"""Authentication router for login, signup, logout, and current user."""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.auth import LoginRequest, LoginResponse, SignupResponse, LogoutResponse, ErrorResponse
from app.models.user import UserCreate, User
from app.services.auth_service import authenticate_user, create_user, create_access_token
from app.dependencies import get_current_user, security
from app.database.mock_db import db


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Authenticate user and return JWT token."""
    user = authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Return user without hashed password
    user_dict = user.model_dump(by_alias=True, exclude={"hashed_password"})
    
    return LoginResponse(
        success=True,
        user=user_dict,
        token=access_token,
    )


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Create a new user account."""
    # Check if email already exists
    if db.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )
    
    # Check if username already exists
    if db.get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    
    # Create user
    user = create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        avatar=user_data.avatar,
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user",
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Return user without hashed password
    user_dict = user.model_dump(by_alias=True, exclude={"hashed_password"})
    
    return SignupResponse(
        success=True,
        user=user_dict,
        token=access_token,
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(credentials = Depends(security)):
    """Logout user by blacklisting the token."""
    token = credentials.credentials
    db.blacklist_token(token)
    
    return LogoutResponse(success=True)


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user
