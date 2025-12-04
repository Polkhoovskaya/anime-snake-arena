"""Tests for leaderboard endpoints."""
import pytest


def test_get_leaderboard(client):
    """Test getting the leaderboard."""
    response = client.get("/api/leaderboard")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check first entry structure
    first_entry = data[0]
    assert "rank" in first_entry
    assert "user" in first_entry
    assert "score" in first_entry
    assert "mode" in first_entry
    assert "date" in first_entry
    
    # Verify ranking order
    assert first_entry["rank"] == 1
    
    # Verify scores are in descending order
    for i in range(len(data) - 1):
        assert data[i]["score"] >= data[i + 1]["score"]


def test_get_leaderboard_filter_by_mode(client):
    """Test filtering leaderboard by game mode."""
    response = client.get("/api/leaderboard?mode=walls")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # All entries should be for 'walls' mode
    for entry in data:
        assert entry["mode"] == "walls"


def test_get_leaderboard_pagination(client):
    """Test leaderboard pagination."""
    # Get first 2 entries
    response1 = client.get("/api/leaderboard?limit=2&offset=0")
    assert response1.status_code == 200
    data1 = response1.json()
    assert len(data1) <= 2
    
    # Get next 2 entries
    response2 = client.get("/api/leaderboard?limit=2&offset=2")
    assert response2.status_code == 200
    data2 = response2.json()
    
    # Verify different entries
    if len(data1) > 0 and len(data2) > 0:
        assert data1[0]["rank"] != data2[0]["rank"]


def test_get_leaderboard_limit(client):
    """Test leaderboard limit parameter."""
    response = client.get("/api/leaderboard?limit=1")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 1


def test_get_leaderboard_invalid_mode(client):
    """Test leaderboard with invalid mode."""
    response = client.get("/api/leaderboard?mode=invalid")
    
    # Should return 422 for invalid enum value
    assert response.status_code == 422
