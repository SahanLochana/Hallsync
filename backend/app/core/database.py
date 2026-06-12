from pymongo import AsyncMongoClient
from app.core.config import settings


class Database:
    def __init__(self):
        self.client = AsyncMongoClient(settings.MONGODB_URL)
        self.database = self.client[settings.DATABASE_NAME]

    # async def get_db(self):
    #     return self.database

    def get_collection(self, name: str):
        return self.database[name]

    def close(self):
        self.client.close()
