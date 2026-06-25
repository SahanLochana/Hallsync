from pymongo import AsyncMongoClient
from app.core.config import settings


class Database:
    def __init__(self):
        self.client = AsyncMongoClient(settings.MONGODB_URL)
        self.database = self.client[settings.DATABASE_NAME]

    # async def get_db(self):
    #     return self.database

    async def create_index(self):
        user_collection = self.database.get_collection(settings.USER_COLLECTION)
        await user_collection.create_index("universityId", unique=True)

        hall_collection = self.database.get_collection(settings.HALL_COLLECTION)
        await hall_collection.create_index("hallId", unique=True)

    def get_collection(self, name: str):
        return self.database[name]

    async def close(self):
        await self.client.close()
