from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")

    PROJECT_NAME: str = "FastAPI Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeychangeinproduction123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./app.db"

settings = Settings()
