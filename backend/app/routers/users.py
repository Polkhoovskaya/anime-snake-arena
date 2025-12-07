"""Users router for user profile management."""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.models.user import User, UserUpdate
from app.dependencies import get_current_user
from app.database.database import get_db
from app.services import db_service
from app.database import models


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    user = db_service.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.patch("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the authenticated user's profile."""
    # Check if username is being changed and if it's already taken
    if update_data.username and update_data.username != current_user.username:
        existing_user = db_service.get_user_by_username(db, update_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
    
    # Update user
    update_dict = update_data.model_dump(exclude_unset=True)
    updated_user = db_service.update_user(db, current_user.id, **update_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile",
        )
    
    # Return response
    # Manually constructing response as Pydantic model conversion happens automatically
    
    return {
        "success": True,
        "user": updated_user,
    }

