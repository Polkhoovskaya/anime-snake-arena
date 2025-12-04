from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class GameMode(str, Enum):
    """Game mode enum."""
    PASS_THROUGH = "pass-through"
    WALLS = "walls"


class GameResult(BaseModel):
    """Game result submission model."""
    score: int = Field(..., ge=0)
    mode: GameMode
    duration: int = Field(..., ge=0, description="Game duration in seconds")


class ScoreSubmissionResponse(BaseModel):
    """Score submission response model."""
    success: bool = True
    new_high_score: bool = Field(alias="newHighScore")
    rank: int | None = None
    
    class Config:
        populate_by_name = True


class LeaderboardEntry(BaseModel):
    """Leaderboard entry model."""
    rank: int = Field(..., ge=1)
    user: dict
    score: int = Field(..., ge=0)
    mode: GameMode
    date: datetime
    
    class Config:
        populate_by_name = True


class LiveGame(BaseModel):
    """Live game model."""
    id: str
    player: dict
    score: int = Field(..., ge=0)
    mode: GameMode
    viewers: int = Field(..., ge=0)
    started_at: datetime = Field(alias="startedAt")
    
    class Config:
        populate_by_name = True
