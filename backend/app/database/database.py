from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Default to SQLite, but allow override for PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Check if using SQLite
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific args
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
