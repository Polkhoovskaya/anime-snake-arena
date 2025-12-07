"""Mock database using in-memory dictionaries."""
from datetime import datetime, timedelta, UTC
from typing import Dict, List, Optional
from app.models.user import UserInDB
from app.models.game import GameMode


class MockDatabase:
    """In-memory mock database."""
    
    def __init__(self):
        """Initialize the mock database with sample data."""
        self.users: Dict[str, UserInDB] = {}
        self.scores: List[dict] = []
        self.live_games: Dict[str, dict] = {}
        self.blacklisted_tokens: set = set()
        self._user_counter = 0
        self._game_counter = 0
        
        # Populate with sample data
        self._populate_sample_data()
    
    def _populate_sample_data(self):
        """Populate database with sample users and scores."""
        import bcrypt
        
        def hash_password(password: str) -> str:
            """Hash a password using bcrypt."""
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        
        # Sample users
        sample_users = [
            {
                "username": "SnakeMaster",
                "email": "snake@test.com",
                "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Chihiro&backgroundColor=b6e3f4",
                "password": "password123",
                "high_score": 2450,
                "games_played": 156,
            },
            {
                "username": "ProGamer",
                "email": "pro@test.com",
                "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Totoro&backgroundColor=c0aede",
                "password": "password123",
                "high_score": 2100,
                "games_played": 89,
            },
            {
                "username": "Speedster",
                "email": "speed@test.com",
                "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Ponyo&backgroundColor=ffdfbf",
                "password": "password123",
                "high_score": 1850,
                "games_played": 124,
            },
            {
                "username": "KikiWitch",
                "email": "kiki@test.com",
                "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Kiki&backgroundColor=d1d4f9",
                "password": "password123",
                "high_score": 1600,
                "games_played": 45,
            },
            {
                "username": "HowlWizard",
                "email": "howl@test.com",
                "avatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Howl&backgroundColor=ffd5dc",
                "password": "password123",
                "high_score": 2800,
                "games_played": 210,
            },
        ]
        
        for user_data in sample_users:
            self._user_counter += 1
            user = UserInDB(
                id=str(self._user_counter),
                username=user_data["username"],
                email=user_data["email"],
                avatar=user_data["avatar"],
                high_score=user_data["high_score"],
                games_played=user_data["games_played"],
                hashed_password=hash_password(user_data["password"]),
                created_at=datetime.now(UTC) - timedelta(days=30),
            )
            self.users[user.id] = user
        
        # Sample scores for leaderboard
        self.scores = [
            {
                "id": "1",
                "user_id": "1",
                "score": 2450,
                "mode": GameMode.WALLS,
                "date": datetime.now(UTC) - timedelta(days=1),
            },
            {
                "id": "2",
                "user_id": "2",
                "score": 2100,
                "mode": GameMode.WALLS,
                "date": datetime.now(UTC) - timedelta(days=2),
            },
            {
                "id": "3",
                "user_id": "3",
                "score": 1850,
                "mode": GameMode.PASS_THROUGH,
                "date": datetime.now(UTC) - timedelta(days=3),
            },
            {
                "id": "4",
                "user_id": "1",
                "score": 1920,
                "mode": GameMode.PASS_THROUGH,
                "date": datetime.now(UTC) - timedelta(days=4),
            },
        ]
        
        # Sample live games
        self.live_games = {
            "live1": {
                "id": "live1",
                "player_id": "2",
                "score": 340,
                "mode": GameMode.WALLS,
                "viewers": 12,
                "started_at": datetime.now(UTC) - timedelta(minutes=5),
            }
        }
    
    def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        return self.users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        """Get user by username."""
        for user in self.users.values():
            if user.username == username:
                return user
        return None
    
    def create_user(self, user: UserInDB) -> UserInDB:
        """Create a new user."""
        self._user_counter += 1
        user.id = str(self._user_counter)
        self.users[user.id] = user
        return user
    
    def update_user(self, user_id: str, **kwargs) -> Optional[UserInDB]:
        """Update user fields."""
        user = self.users.get(user_id)
        if not user:
            return None
        
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        
        return user
    
    def add_score(self, user_id: str, score: int, mode: GameMode, duration: int) -> dict:
        """Add a new score."""
        score_entry = {
            "id": str(len(self.scores) + 1),
            "user_id": user_id,
            "score": score,
            "mode": mode,
            "duration": duration,
            "date": datetime.now(UTC),
        }
        self.scores.append(score_entry)
        
        # Update user's high score and games played
        user = self.users.get(user_id)
        if user:
            user.games_played += 1
            if score > user.high_score:
                user.high_score = score
        
        return score_entry
    
    def get_leaderboard(
        self, 
        mode: Optional[GameMode] = None, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[dict]:
        """Get leaderboard entries."""
        # Filter by mode if specified
        filtered_scores = self.scores
        if mode:
            filtered_scores = [s for s in self.scores if s["mode"] == mode]
        
        # Sort by score descending
        sorted_scores = sorted(filtered_scores, key=lambda x: x["score"], reverse=True)
        
        # Apply pagination
        paginated_scores = sorted_scores[offset:offset + limit]
        
        return paginated_scores
    
    def get_live_games(self, mode: Optional[GameMode] = None) -> List[dict]:
        """Get live games."""
        games = list(self.live_games.values())
        if mode:
            games = [g for g in games if g["mode"] == mode]
        return games
    
    def get_live_game(self, game_id: str) -> Optional[dict]:
        """Get a specific live game."""
        return self.live_games.get(game_id)
    
    def blacklist_token(self, token: str):
        """Add token to blacklist."""
        self.blacklisted_tokens.add(token)
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        return token in self.blacklisted_tokens
    
    def reset(self):
        """Reset the database (useful for testing)."""
        self.__init__()


# Global database instance
db = MockDatabase()
