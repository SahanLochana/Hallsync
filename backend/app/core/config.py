from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL:str = ""
    DATABASE_NAME:str = "asdfadsf"
    USER_COLLECTION:str = "asdfasdf"
    HALL_COLLECTION:str = "asdfasdf"
    
    JWT_SECRET_KEY:str = "asdfasdf"
    JWT_ALGORITHM:str = "HS256"
    JWT_EXPIRE_MINUTES:int = 60

    # class Config:
    #     env_file = ".env"


settings = Settings()
