from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SqEnum
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database.database import Base
from app.models.game import GameMode
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String)
    high_score = Column(Integer, default=0)
    games_played = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    scores = relationship("Score", back_populates="user")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    mode = Column(SqEnum(GameMode))
    duration = Column(Integer, default=0)
    date = Column(DateTime, default=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="scores")
