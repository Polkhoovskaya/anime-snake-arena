"""Games router for score submission."""
from fastapi import APIRouter, Depends
from app.models.game import GameResult, ScoreSubmissionResponse
from app.models.user import User
from app.dependencies import get_current_user
from app.database.mock_db import db


router = APIRouter(prefix="/games", tags=["Games"])


@router.post("/score", response_model=ScoreSubmissionResponse)
async def submit_score(
    game_result: GameResult,
    current_user: User = Depends(get_current_user),
):
    """Submit a game score for the authenticated user."""
    # Get user's previous high score
    previous_high_score = current_user.high_score
    
    # Add score to database
    db.add_score(
        user_id=current_user.id,
        score=game_result.score,
        mode=game_result.mode,
        duration=game_result.duration,
    )
    
    # Check if it's a new high score
    new_high_score = game_result.score > previous_high_score
    
    # Calculate rank on leaderboard for this mode
    leaderboard = db.get_leaderboard(mode=game_result.mode, limit=1000, offset=0)
    rank = None
    
    # Find user's rank
    for idx, score_entry in enumerate(leaderboard, start=1):
        if score_entry["user_id"] == current_user.id:
            rank = idx
            break
    
    return ScoreSubmissionResponse(
        success=True,
        new_high_score=new_high_score,
        rank=rank,
    )
