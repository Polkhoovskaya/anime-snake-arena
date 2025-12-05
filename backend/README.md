# Snake Arena Backend

FastAPI backend for the Snake Arena game application.

## Features

- 🔐 JWT-based authentication
- 👤 User management and profiles
- 🏆 Leaderboard system
- 🎮 Live game spectating
- 📊 Score submission and tracking
- 🎨 Avatar selection
- ✅ Comprehensive test suite (35 tests)

## Quick Start

### Install Dependencies

```bash
uv sync
```

### Run Development Server

```bash
uv run python main.py
```

The server will start on `http://localhost:8000`

### Run Tests

```bash
uv run pytest tests/ -v
```

## API Documentation

Once the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/{userId}` - Get user by ID
- `PATCH /api/users/profile` - Update profile
- `GET /api/avatars` - Get available avatars

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (with filtering & pagination)

### Live Games
- `GET /api/games/live` - Get live games
- `GET /api/games/live/{gameId}` - Get specific live game

### Games
- `POST /api/games/score` - Submit game score

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── dependencies.py      # Auth dependencies
│   ├── models/              # Pydantic models
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   └── database/            # Mock database
├── tests/                   # Test suite
└── main.py                  # Entry point
```

## Mock Database

Currently using an in-memory mock database for development. Sample data includes:

- 3 pre-populated users
- Sample leaderboard entries
- 1 active live game

### Sample User Credentials

```
Email: snake@test.com
Password: password123
```

## Environment Variables

Create a `.env` file (optional):

```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_DAYS=7
```

## Development

### Add New Dependencies

```bash
uv add package-name
```

### Add Dev Dependencies

```bash
uv add --dev package-name
```

## Testing

Run all tests:
```bash
uv run pytest tests/ -v
```

Run specific test file:
```bash
uv run pytest tests/test_auth.py -v
```

Run with coverage:
```bash
uv run pytest tests/ --cov=app
```

## Migration to Real Database

The mock database is designed for easy replacement:

1. Create database models (e.g., SQLAlchemy)
2. Implement database service with same interface
3. Update imports in routers
4. Add database connection in main.py

## Technologies

- **FastAPI** - Modern web framework
- **Pydantic** - Data validation
- **python-jose** - JWT tokens
- **bcrypt** - Password hashing
- **pytest** - Testing
- **uvicorn** - ASGI server

## License

See main project LICENSE.
