from datetime import datetime, UTC
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user model."""
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    avatar: str


class UserCreate(UserBase):
    """User creation model (signup)."""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """User update model (profile update)."""
    username: str | None = Field(None, min_length=3, max_length=20)
    avatar: str | None = None


class User(UserBase):
    """Public user model."""
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    id: str
    high_score: int = Field(default=0, alias="highScore")
    games_played: int = Field(default=0, alias="gamesPlayed")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), alias="createdAt")


class UserInDB(User):
    """Internal user model with hashed password."""
    hashed_password: str
