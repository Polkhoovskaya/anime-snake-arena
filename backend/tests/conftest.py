"""Test fixtures and configuration."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database.database import Base, get_db
from app.database import models
from app.services import db_service
from app.models.user import UserCreate

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Clear global state in db_service
    db_service._blacklisted_tokens.clear()
    db_service._live_games.clear()
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


@pytest.fixture
def test_user(db_session):
    """Create a test user and return credentials."""
    user_data = UserCreate(
        username="TestUser",
        email="test@example.com",
        password="testpass123",
        avatar="https://api.dicebear.com/7.x/lorelei/svg?seed=Test&backgroundColor=b6e3f4"
    )
    # Create user in DB directly to avoid API call overhead/issues in setup
    db_service.create_user(db_session, user_data)
    
    return {
        "username": "TestUser",
        "email": "test@example.com",
        "password": "testpass123",
        "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Test&backgroundColor=b6e3f4",
    }


@pytest.fixture
def auth_headers(client, test_user):
    """Create a user and return authentication headers."""
    # User is already created by test_user fixture, just login
    response = client.post(
        "/api/auth/login",
        json={"email": test_user["email"], "password": test_user["password"]}
    )
    assert response.status_code == 200
    
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def existing_user_token(client, db_session):
    """Get token for an existing user from the database."""
    # Create another user
    user_data = UserCreate(
        username="SnakeMaster",
        email="snake@test.com",
        password="password123",
        avatar="https://api.dicebear.com/7.x/lorelei/svg?seed=Chihiro"
    )
    db_service.create_user(db_session, user_data)
    
    # Login
    response = client.post(
        "/api/auth/login",
        json={"email": "snake@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}
