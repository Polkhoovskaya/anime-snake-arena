"""Tests for authentication endpoints."""
import pytest


def test_signup_success(client):
    """Test successful user signup."""
    new_user = {
        "username": "NewUser",
        "email": "new@example.com",
        "password": "newpassword123",
        "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=New"
    }
    response = client.post("/api/auth/signup", json=new_user)
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["username"] == new_user["username"]
    assert data["user"]["email"] == new_user["email"]
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


def test_signup_duplicate_email(client, test_user):
    """Test signup with duplicate email."""
    # test_user is already created in DB by fixture
    
    # Try to signup again with same email
    new_user = {
        "username": "AnotherUser",
        "email": test_user["email"],  # Same email
        "password": "password123",
        "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Another"
    }
    response = client.post("/api/auth/signup", json=new_user)
    
    assert response.status_code == 400
    data = response.json()
    assert "Email already exists" in data["detail"]


def test_signup_duplicate_username(client, test_user):
    """Test signup with duplicate username."""
    # test_user is already created in DB by fixture
    
    # Try to signup with different email but same username
    new_user = {
        "username": test_user["username"],  # Same username
        "email": "different@example.com",
        "password": "password123",
        "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Different"
    }
    response = client.post("/api/auth/signup", json=new_user)
    
    assert response.status_code == 400
    data = response.json()
    assert "Username already taken" in data["detail"]


def test_login_success(client, test_user):
    """Test successful login."""
    # User is already created by fixture
    
    # Now login
    response = client.post(
        "/api/auth/login",
        json={"email": test_user["email"], "password": test_user["password"]}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == test_user["email"]


def test_login_invalid_email(client):
    """Test login with invalid email."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpass"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "Invalid email or password" in data["detail"]


def test_login_invalid_password(client, test_user):
    """Test login with invalid password."""
    # User is already created by fixture
    
    # Try to login with wrong password
    response = client.post(
        "/api/auth/login",
        json={"email": test_user["email"], "password": "wrongpassword"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "Invalid email or password" in data["detail"]


def test_get_current_user(client, auth_headers):
    """Test getting current user information."""
    response = client.get("/api/auth/me", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "username" in data
    assert "email" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_get_current_user_no_token(client):
    """Test getting current user without token."""
    response = client.get("/api/auth/me")
    
    assert response.status_code == 401


def test_get_current_user_invalid_token(client):
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401


def test_logout(client, auth_headers):
    """Test logout functionality."""
    response = client.post("/api/auth/logout", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    # Try to use the token after logout
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 401
