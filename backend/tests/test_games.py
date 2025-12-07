"""Tests for game score submission endpoints."""
import pytest


def test_submit_score_success(client, auth_headers):
    """Test successful score submission."""
    game_result = {
        "score": 500,
        "mode": "walls",
        "duration": 120
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "newHighScore" in data
    assert isinstance(data["newHighScore"], bool)


def test_submit_score_new_high_score(client, auth_headers):
    """Test submitting a new high score."""
    # Submit a high score
    game_result = {
        "score": 5000,
        "mode": "walls",
        "duration": 300
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["newHighScore"] is True


def test_submit_score_not_high_score(client, existing_user_token):
    """Test submitting a score that's not a new high score."""
    # First submit a high score
    client.post(
        "/api/games/score",
        json={"score": 2450, "mode": "walls", "duration": 300},
        headers=existing_user_token
    )
    
    # Now submit a lower score
    game_result = {
        "score": 100,
        "mode": "walls",
        "duration": 60
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=existing_user_token
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["newHighScore"] is False


def test_submit_score_with_rank(client, auth_headers):
    """Test that score submission returns rank."""
    game_result = {
        "score": 500,
        "mode": "walls",
        "duration": 120
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    # Rank may be None if user is not in top rankings yet
    assert "rank" in data


def test_submit_score_no_auth(client):
    """Test submitting score without authentication."""
    game_result = {
        "score": 500,
        "mode": "walls",
        "duration": 120
    }
    
    response = client.post("/api/games/score", json=game_result)
    
    assert response.status_code == 401


def test_submit_score_invalid_data(client, auth_headers):
    """Test submitting invalid score data."""
    # Negative score
    game_result = {
        "score": -100,
        "mode": "walls",
        "duration": 120
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=auth_headers
    )
    
    assert response.status_code == 422


def test_submit_score_invalid_mode(client, auth_headers):
    """Test submitting score with invalid mode."""
    game_result = {
        "score": 500,
        "mode": "invalid-mode",
        "duration": 120
    }
    
    response = client.post(
        "/api/games/score",
        json=game_result,
        headers=auth_headers
    )
    
    assert response.status_code == 422


def test_submit_multiple_scores(client, auth_headers):
    """Test submitting multiple scores."""
    # Submit first score
    response1 = client.post(
        "/api/games/score",
        json={"score": 100, "mode": "walls", "duration": 60},
        headers=auth_headers
    )
    assert response1.status_code == 200
    
    # Submit second higher score
    response2 = client.post(
        "/api/games/score",
        json={"score": 200, "mode": "walls", "duration": 90},
        headers=auth_headers
    )
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["newHighScore"] is True
