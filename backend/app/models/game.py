from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


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
    model_config = ConfigDict(populate_by_name=True)
    
    success: bool = True
    new_high_score: bool = Field(alias="newHighScore")
    rank: int | None = None


class LeaderboardEntry(BaseModel):
    """Leaderboard entry model."""
    model_config = ConfigDict(populate_by_name=True)
    
    rank: int = Field(..., ge=1)
    user: dict
    score: int = Field(..., ge=0)
    mode: GameMode
    date: datetime


class LiveGame(BaseModel):
    """Live game model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    player: dict
    score: int = Field(..., ge=0)
    mode: GameMode
    viewers: int = Field(..., ge=0)
    started_at: datetime = Field(alias="startedAt")
