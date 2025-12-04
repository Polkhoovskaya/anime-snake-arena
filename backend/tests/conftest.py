"""Test fixtures and configuration."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.mock_db import db


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset the database before each test."""
    db.reset()
    yield
    # Cleanup after test if needed


@pytest.fixture
def test_user():
    """Create a test user and return credentials."""
    return {
        "username": "TestUser",
        "email": "test@example.com",
        "password": "testpass123",
        "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Test&backgroundColor=b6e3f4",
    }


@pytest.fixture
def auth_headers(client, test_user):
    """Create a user and return authentication headers."""
    # Sign up the user
    response = client.post("/api/auth/signup", json=test_user)
    assert response.status_code == 201
    
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def existing_user_token(client):
    """Get token for an existing user from the database."""
    # Login as the pre-existing user
    response = client.post(
        "/api/auth/login",
        json={"email": "snake@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}
