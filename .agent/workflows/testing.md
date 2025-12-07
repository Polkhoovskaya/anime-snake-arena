---
description: How to run automated tests and manual verification
---

# Automated Tests

## Backend
Run the backend tests (pytest):
```bash
cd backend
make test
```
This runs `uv run pytest`.

## Frontend
Run the frontend tests (vitest):
```bash
cd frontend
npm test
```
This runs `vitest` in watch mode. Press `q` to quit.
To run once: `npx vitest run`

# Manual Verification

1. Start the application:
```bash
npm run dev
```
2. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Features to Check
- **Login/Signup**: Create an account or log in.
- **Profile**: Check your username is displayed.
- **Leaderboard**: Navigate to the Leaderboard page.
- **Watch**: Navigate to the Watch page to see simulated live games.
