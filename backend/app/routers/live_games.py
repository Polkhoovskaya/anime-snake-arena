"""Live games router for spectating active games."""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.models.game import LiveGame, GameMode
from app.database.mock_db import db


router = APIRouter(prefix="/games/live", tags=["Live Games"])


@router.get("", response_model=list[LiveGame])
async def get_live_games(
    mode: Optional[GameMode] = Query(None, description="Filter by game mode"),
):
    """Get list of currently active games."""
    # Get live games from database
    games = db.get_live_games(mode=mode)
    
    # Build live game responses
    live_games = []
    for game in games:
        user = db.get_user_by_id(game["player_id"])
        if user:
            user_dict = user.model_dump(by_alias=True, exclude={"hashed_password"})
            live_game = LiveGame(
                id=game["id"],
                player=user_dict,
                score=game["score"],
                mode=game["mode"],
                viewers=game["viewers"],
                started_at=game["started_at"],
            )
            live_games.append(live_game)
    
    return live_games


@router.get("/{game_id}", response_model=LiveGame)
async def get_live_game(game_id: str):
    """Get details of a specific live game."""
    game = db.get_live_game(game_id)
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    # Get player information
    user = db.get_user_by_id(game["player_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found",
        )
    
    user_dict = user.model_dump(by_alias=True, exclude={"hashed_password"})
    
    return LiveGame(
        id=game["id"],
        player=user_dict,
        score=game["score"],
        mode=game["mode"],
        viewers=game["viewers"],
        started_at=game["started_at"],
    )
