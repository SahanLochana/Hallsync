from pymongo import ReturnDocument
from app.core.database import Database
from app.core.config import settings


class UserRepo:
    def __init__(self):
        self.db = Database()
        self.user_collection = self.db.get_collection(settings.USER_COLLECTION)

    def _format_user(self, doc: dict) -> dict:
        """Strips MongoDB internal fields and normalises role casing."""
        doc = doc.copy()
        if "_id" in doc:
            del doc["_id"]
        if "role" in doc and isinstance(doc["role"], str):
            doc["role"] = doc["role"].lower()
        return doc

    async def get_users(self):
        cursor = self.user_collection.find()
        users = await cursor.to_list(length=100)
        return [self._format_user(u) for u in users]

    async def get_user_by_university_id(self, university_id: str) -> dict | None:
        user = await self.user_collection.find_one({"universityId": university_id})
        return self._format_user(user) if user else None

    async def update_user(self, university_id: str, update_data: dict) -> dict | None:
        db_update = update_data.copy()
        if "role" in db_update and isinstance(db_update["role"], str):
            db_update["role"] = db_update["role"].capitalize()

        user = await self.user_collection.find_one_and_update(
            {"universityId": university_id},
            {"$set": db_update},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_user(user) if user else None

    async def delete_user(self, university_id: str) -> bool:
        result = await self.user_collection.delete_one({"universityId": university_id})
        return result.deleted_count > 0

    async def create_user(self, user_data: dict) -> dict:
        db_user = user_data.copy()
        if "role" in db_user and isinstance(db_user["role"], str):
            db_user["role"] = db_user["role"].capitalize()

        await self.user_collection.insert_one(db_user)
        return self._format_user(db_user)
