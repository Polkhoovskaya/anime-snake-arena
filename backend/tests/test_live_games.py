"""Tests for live games endpoints."""
import pytest


def test_get_live_games(client, populated_live_games):
    """Test getting list of live games."""
    response = client.get("/api/games/live")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # Check structure if there are live games
    if len(data) > 0:
        game = data[0]
        assert "id" in game
        assert "player" in game
        assert "score" in game
        assert "mode" in game
        assert "viewers" in game
        assert "startedAt" in game


def test_get_live_games_filter_by_mode(client, populated_live_games):
    """Test filtering live games by mode."""
    response = client.get("/api/games/live?mode=walls")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # All games should be 'walls' mode
    for game in data:
        assert game["mode"] == "walls"


@pytest.fixture
def populated_live_games(db_session):
    """Populate live games for tests."""
    from app.services import db_service
    from app.models.user import UserCreate
    from app.models.game import GameMode
    from datetime import datetime, UTC
    
    # Create a player
    user_data = UserCreate(
        username="LivePlayer",
        email="live@example.com",
        password="password123",
        avatar="https://api.dicebear.com/7.x/lorelei/svg?seed=Live"
    )
    user = db_service.create_user(db_session, user_data)
    
    # Add live game directly to service memory
    db_service._live_games["live1"] = {
        "id": "live1",
        "player_id": user.id,
        "score": 150,
        "mode": GameMode.PASS_THROUGH,
        "viewers": 5,
        "started_at": datetime.now(UTC)
    }
    
    # Add another for walls mode
    db_service._live_games["live2"] = {
        "id": "live2",
        "player_id": user.id,
        "score": 200,
        "mode": GameMode.WALLS,
        "viewers": 10,
        "started_at": datetime.now(UTC)
    }
    
    yield
    
    # Cleanup
    db_service._live_games.clear()


def test_get_live_game_by_id(client, populated_live_games):
    """Test getting a specific live game."""
    response = client.get("/api/games/live/live1")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "live1"
    assert "player" in data
    assert "score" in data
    assert "mode" in data
    assert "viewers" in data
    assert "startedAt" in data


def test_get_live_game_not_found(client):
    """Test getting non-existent live game."""
    response = client.get("/api/games/live/nonexistent")
    
    assert response.status_code == 404
    data = response.json()
    assert "Game not found" in data["detail"]


def test_live_game_player_info(client, populated_live_games):
    """Test that live game includes player information."""
    response = client.get("/api/games/live/live1")
    
    assert response.status_code == 200
    data = response.json()
    
    player = data["player"]
    assert "id" in player
    assert "username" in player
    assert "avatar" in player
    assert "password" not in player
    assert "hashed_password" not in player
