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

    def get_collection(self, name: str):
        return self.database[name]

    async def close(self):
        await self.client.close()


# Global instances for legacy routes
db = Database()
lectures_collection = db.get_collection("lectures")
reports_collection = db.get_collection("reports")
timetables_collection = db.get_collection("timetables")
notifications_collection = db.get_collection("notifications")
