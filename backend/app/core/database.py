from pymongo import AsyncMongoClient
from app.core.config import settings

class Database:
    def __init__(self):
        self.client = AsyncMongoClient("mongodb://localhost:27017")
        self.database = self.client["lecture_hall_db"]

    async def create_index(self):
        user_collection = self.database.get_collection("users")
        await user_collection.create_index("universityId", unique=True)

        hall_collection = self.database.get_collection("halls")
        await hall_collection.create_index("hallId", unique=True)

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
