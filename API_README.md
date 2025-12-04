# Snake Arena API - OpenAPI Specification

This directory contains the OpenAPI specification for the Snake Arena backend API.

## Files

- **`openapi.yaml`** - Complete OpenAPI 3.0 specification with all endpoints, schemas, and examples

## Overview

The Snake Arena API provides the following functionality:

### Authentication (`/auth`)
- **POST /auth/login** - User login with email/password
- **POST /auth/signup** - User registration
- **POST /auth/logout** - User logout
- **GET /auth/me** - Get current authenticated user

### Users (`/users`)
- **GET /users/{userId}** - Get user profile by ID
- **PATCH /users/profile** - Update authenticated user's profile
- **GET /avatars** - Get available avatar URLs

### Leaderboard (`/leaderboard`)
- **GET /leaderboard** - Get leaderboard entries (filterable by game mode)

### Live Games (`/games/live`)
- **GET /games/live** - Get list of currently active games
- **GET /games/live/{gameId}** - Get specific live game details

### Games (`/games`)
- **POST /games/score** - Submit game score

## Data Models

### User
- `id` - Unique identifier
- `username` - Display name (3-20 characters)
- `email` - Email address
- `avatar` - Avatar image URL
- `highScore` - Highest score achieved
- `gamesPlayed` - Total games played
- `createdAt` - Account creation date

### LeaderboardEntry
- `rank` - Position on leaderboard
- `user` - User object
- `score` - Score achieved
- `mode` - Game mode (pass-through or walls)
- `date` - When score was achieved

### LiveGame
- `id` - Game session ID
- `player` - User object
- `score` - Current score
- `mode` - Game mode
- `viewers` - Number of spectators
- `startedAt` - Game start time

### GameResult
- `score` - Final score
- `mode` - Game mode played
- `duration` - Game duration in seconds

## Game Modes

The game supports two modes:
- **`walls`** - Traditional snake game where hitting walls ends the game
- **`pass-through`** - Snake wraps around screen edges

## Authentication

The API uses JWT (JSON Web Token) bearer authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/auth/login` or `/auth/signup` endpoints.

## Usage Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"snake@test.com","password":"password123"}'
```

### Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard?mode=walls&limit=10
```

### Submit Score
```bash
curl -X POST http://localhost:3000/api/games/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"score":450,"mode":"walls","duration":180}'
```

## Viewing the Specification

You can view and interact with this API specification using:

1. **Swagger UI** - Interactive API documentation
   ```bash
   npx swagger-ui-watcher openapi.yaml
   ```

2. **Redoc** - Clean, responsive API documentation
   ```bash
   npx @redocly/cli preview-docs openapi.yaml
   ```

3. **VS Code** - Use the "OpenAPI (Swagger) Editor" extension

## Implementation Notes

Based on the frontend analysis:

1. **Authentication Flow**
   - Frontend stores user data in localStorage
   - Backend should implement JWT-based authentication
   - Token should be included in all protected endpoints

2. **Real-time Features**
   - Live games list refreshes every 5 seconds
   - Consider implementing WebSocket for real-time game updates

3. **Score Submission**
   - Scores are submitted automatically when game ends
   - Backend should validate scores and update user's high score
   - Return whether it's a new personal best

4. **Leaderboard**
   - Support filtering by game mode
   - Implement pagination for large datasets
   - Current user should be highlighted if in top results

5. **Avatar System**
   - Frontend uses Dicebear API for avatars
   - Backend should store avatar URLs, not generate them
   - Provide list of pre-approved avatar URLs

## Next Steps

To implement the backend based on this specification:

1. Choose your backend framework (Node.js/Express, Python/FastAPI, Go/Gin, etc.)
2. Set up database schema matching the data models
3. Implement JWT authentication middleware
4. Create endpoint handlers following the OpenAPI spec
5. Add input validation matching the schema constraints
6. Implement business logic (score validation, leaderboard ranking, etc.)
7. Add tests for each endpoint
8. Set up CORS for frontend integration
