"""Leaderboard router for game rankings."""
from typing import Optional
from fastapi import APIRouter, Query
from app.models.game import LeaderboardEntry, GameMode
from app.database.mock_db import db


router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    mode: Optional[GameMode] = Query(None, description="Filter by game mode"),
    limit: int = Query(50, ge=1, le=100, description="Number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
):
    """Get leaderboard entries."""
    # Get scores from database
    scores = db.get_leaderboard(mode=mode, limit=limit, offset=offset)
    
    # Build leaderboard entries
    leaderboard = []
    for idx, score in enumerate(scores, start=offset + 1):
        user = db.get_user_by_id(score["user_id"])
        if user:
            user_dict = user.model_dump(by_alias=True, exclude={"hashed_password"})
            entry = LeaderboardEntry(
                rank=idx,
                user=user_dict,
                score=score["score"],
                mode=score["mode"],
                date=score["date"],
            )
            leaderboard.append(entry)
    
    return leaderboard
