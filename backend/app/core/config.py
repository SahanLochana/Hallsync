from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL: str
    DATABASE_NAME: str = "hallsync"
    USER_COLLECTION: str = "users"
    HALL_COLLECTION: str = "halls"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    RESEND_API_KEY:str

    class Config:
        env_file = ".env"


settings = Settings()
