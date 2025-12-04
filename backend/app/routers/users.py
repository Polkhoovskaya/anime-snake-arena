"""Users router for user profile management."""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import User, UserUpdate
from app.dependencies import get_current_user
from app.database.mock_db import db


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID."""
    user = db.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.patch("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update the authenticated user's profile."""
    # Check if username is being changed and if it's already taken
    if update_data.username and update_data.username != current_user.username:
        existing_user = db.get_user_by_username(update_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
    
    # Update user
    update_dict = update_data.model_dump(exclude_unset=True)
    updated_user = db.update_user(current_user.id, **update_dict)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile",
        )
    
    # Return response
    user_dict = updated_user.model_dump(by_alias=True, exclude={"hashed_password"})
    
    return {
        "success": True,
        "user": user_dict,
    }

