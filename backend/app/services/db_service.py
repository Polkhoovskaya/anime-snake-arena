from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import models
from app.models.user import UserInDB, UserCreate
from app.models.game import GameMode
from datetime import datetime, UTC, timedelta
from typing import Optional, List
import bcrypt

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: UserCreate) -> models.User:
    # Hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        avatar=user.avatar,
        created_at=datetime.now(UTC)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, **kwargs) -> Optional[models.User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    for key, value in kwargs.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
            
    db.commit()
    db.refresh(user)
    return user

def add_score(db: Session, user_id: int, score: int, mode: GameMode, duration: int) -> models.Score:
    db_score = models.Score(
        user_id=user_id,
        score=score,
        mode=mode,
        duration=duration,
        date=datetime.now(UTC)
    )
    db.add(db_score)
    
    # Update user stats
    user = get_user_by_id(db, user_id)
    if user:
        user.games_played += 1
        if score > user.high_score:
            user.high_score = score
            
    db.commit()
    db.refresh(db_score)
    return db_score

def get_leaderboard(db: Session, mode: Optional[GameMode] = None, limit: int = 50, offset: int = 0) -> List[models.Score]:
    query = db.query(models.Score)
    if mode:
        query = query.filter(models.Score.mode == mode)
    
    return query.order_by(desc(models.Score.score)).offset(offset).limit(limit).all()

# Live games are still in-memory as they are transient
_live_games = {}

def get_live_games(mode: Optional[GameMode] = None) -> List[dict]:
    games = list(_live_games.values())
    if mode:
        games = [g for g in games if g["mode"] == mode]
    return games

def get_live_game(game_id: str) -> Optional[dict]:
    return _live_games.get(game_id)

# Token blacklist (in-memory for now, could be Redis or DB table)
_blacklisted_tokens = set()

def blacklist_token(token: str):
    _blacklisted_tokens.add(token)

def is_token_blacklisted(token: str) -> bool:
    return token in _blacklisted_tokens
