"""Games router for score submission."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.game import GameResult, ScoreSubmissionResponse
from app.models.user import User
from app.dependencies import get_current_user
from app.database.database import get_db
from app.services import db_service
from app.database import models


router = APIRouter(prefix="/games", tags=["Games"])


@router.post("/score", response_model=ScoreSubmissionResponse)
async def submit_score(
    game_result: GameResult,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a game score for the authenticated user."""
    # Get user's previous high score
    previous_high_score = current_user.high_score
    
    # Add score to database
    db_service.add_score(
        db,
        user_id=current_user.id,
        score=game_result.score,
        mode=game_result.mode,
        duration=game_result.duration,
    )
    
    # Check if it's a new high score
    new_high_score = game_result.score > previous_high_score
    
    # Calculate rank on leaderboard for this mode
    # Note: This is an expensive operation for a real DB, ideally should be cached or optimized
    leaderboard = db_service.get_leaderboard(db, mode=game_result.mode, limit=1000, offset=0)
    rank = None
    
    # Find user's rank
    for idx, score_entry in enumerate(leaderboard, start=1):
        if score_entry.user_id == current_user.id:
            rank = idx
            break
    
    return ScoreSubmissionResponse(
        success=True,
        new_high_score=new_high_score,
        rank=rank,
    )
