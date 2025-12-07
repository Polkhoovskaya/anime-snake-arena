"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, leaderboard, live_games, games, avatars


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for the Snake Arena game application",
)

# Create database tables
from app.database import models
from app.database.database import engine
models.Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with API prefix
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(leaderboard.router, prefix=settings.API_PREFIX)
app.include_router(live_games.router, prefix=settings.API_PREFIX)
app.include_router(games.router, prefix=settings.API_PREFIX)
app.include_router(avatars.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "Snake Arena API",
        "version": settings.VERSION,
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
