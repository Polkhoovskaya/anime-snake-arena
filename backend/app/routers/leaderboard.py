"""Leaderboard router for game rankings."""
from typing import Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.models.game import LeaderboardEntry, GameMode
from app.database.database import get_db
from app.services import db_service


router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    mode: Optional[GameMode] = Query(None, description="Filter by game mode"),
    limit: int = Query(50, ge=1, le=100, description="Number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    db: Session = Depends(get_db)
):
    """Get leaderboard entries."""
    # Get scores from database
    scores = db_service.get_leaderboard(db, mode=mode, limit=limit, offset=offset)
    
    # Build leaderboard entries
    leaderboard = []
    for idx, score in enumerate(scores, start=offset + 1):
        # Score object has user relationship loaded (or lazy loaded)
        if score.user:
            entry = LeaderboardEntry(
                rank=idx,
                user=score.user,
                score=score.score,
                mode=score.mode,
                date=score.date,
            )
            leaderboard.append(entry)
    
    return leaderboard
