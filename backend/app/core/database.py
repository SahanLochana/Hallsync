from pymongo import AsyncMongoClient
from app.core.config import settings
import certifi


class Database:
    def __init__(self):
        self.client = AsyncMongoClient(
            settings.MONGODB_URL, tls=True, tlsCAFile=certifi.where()
        )
        self.database = self.client[settings.DATABASE_NAME]

    async def create_index(self):
        user_collection = self.database.get_collection(settings.USER_COLLECTION)
        await user_collection.create_index("universityId", unique=True)

        hall_collection = self.database.get_collection("halls")
        await hall_collection.create_index("hallId", unique=True)

        timetables_collection = self.database.get_collection("timetables")
        await timetables_collection.create_index("timetable_id", unique=True)

        modules_collection = self.database.get_collection("modules")
        await modules_collection.create_index("semester", unique=True)

    def get_collection(self, name: str):
        return self.database[name]

    async def close(self):
        await self.client.close()


_db_instance: Database | None = None


def get_db() -> Database:
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance
