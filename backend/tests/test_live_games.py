"""Tests for live games endpoints."""
import pytest


def test_get_live_games(client):
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


def test_get_live_games_filter_by_mode(client):
    """Test filtering live games by mode."""
    response = client.get("/api/games/live?mode=walls")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # All games should be 'walls' mode
    for game in data:
        assert game["mode"] == "walls"


def test_get_live_game_by_id(client):
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


def test_live_game_player_info(client):
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
