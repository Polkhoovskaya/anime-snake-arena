"""Tests for user endpoints."""
import pytest


def test_get_user_by_id(client, existing_user_token):
    """Test getting user by ID."""
    response = client.get("/api/users/1")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "1"
    assert data["username"] == "SnakeMaster"
    assert "password" not in data
    assert "hashed_password" not in data


def test_get_user_not_found(client):
    """Test getting non-existent user."""
    response = client.get("/api/users/999")
    
    assert response.status_code == 404
    data = response.json()
    assert "User not found" in data["detail"]


def test_update_profile_avatar(client, auth_headers):
    """Test updating user avatar."""
    new_avatar = "https://api.dicebear.com/7.x/lorelei/svg?seed=NewAvatar&backgroundColor=c0aede"
    
    response = client.patch(
        "/api/users/profile",
        json={"avatar": new_avatar},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["avatar"] == new_avatar


def test_update_profile_username(client, auth_headers):
    """Test updating username."""
    response = client.patch(
        "/api/users/profile",
        json={"username": "NewUsername"},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "NewUsername"


def test_update_profile_duplicate_username(client, auth_headers):
    """Test updating to an already taken username."""
    response = client.patch(
        "/api/users/profile",
        json={"username": "SnakeMaster"},  # Existing user
        headers=auth_headers
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "Username already taken" in data["detail"]


def test_update_profile_no_auth(client):
    """Test updating profile without authentication."""
    response = client.patch(
        "/api/users/profile",
        json={"username": "NewUsername"}
    )
    
    assert response.status_code == 401


def test_get_avatars(client):
    """Test getting available avatars."""
    response = client.get("/api/avatars")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(url, str) for url in data)
    assert all(url.startswith("https://") for url in data)
