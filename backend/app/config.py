from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production-use-env-var"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # API Settings
    API_PREFIX: str = "/api"
    PROJECT_NAME: str = "Snake Arena API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"


settings = Settings()
