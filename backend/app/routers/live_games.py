"""Live games router for spectating active games."""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.orm import Session
from app.models.game import LiveGame, GameMode
from app.database.database import get_db
from app.services import db_service


router = APIRouter(prefix="/games/live", tags=["Live Games"])


@router.get("", response_model=list[LiveGame])
async def get_live_games(
    mode: Optional[GameMode] = Query(None, description="Filter by game mode"),
    db: Session = Depends(get_db)
):
    """Get list of currently active games."""
    # Get live games from service
    games = db_service.get_live_games(mode=mode)
    
    # Build live game responses
    live_games = []
    for game in games:
        user = db_service.get_user_by_id(db, int(game["player_id"]))
        if user:
            # Manually convert to dict/model as needed
            live_game = LiveGame(
                id=game["id"],
                player=user,
                score=game["score"],
                mode=game["mode"],
                viewers=game["viewers"],
                started_at=game["started_at"],
            )
            live_games.append(live_game)
    
    return live_games


@router.get("/{game_id}", response_model=LiveGame)
async def get_live_game(game_id: str, db: Session = Depends(get_db)):
    """Get details of a specific live game."""
    game = db_service.get_live_game(game_id)
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    # Get player information
    user = db_service.get_user_by_id(db, int(game["player_id"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    return LiveGame(
        id=game["id"],
        player=user,
        score=game["score"],
        mode=game["mode"],
        viewers=game["viewers"],
        started_at=game["started_at"],
    )
