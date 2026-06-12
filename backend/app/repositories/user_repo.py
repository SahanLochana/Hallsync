from pymongo import ReturnDocument
from app.core.database import Database
from app.core.config import settings


class UserRepo:
    def __init__(self):
        self.db = Database()
        self.user_collection = self.db.get_collection(settings.USER_COLLECTION)

    def _format_user(self, doc: dict) -> dict:
        doc = doc.copy()
        if "id" in doc:
            doc["uid"] = doc.pop("id")
        if "role" in doc and isinstance(doc["role"], str):
            doc["role"] = doc["role"].lower()
        if "_id" in doc:
            del doc["_id"]
        return doc

    async def get_users(self):
        cursor = self.user_collection.find()
        users = await cursor.to_list(length=100)
        return [self._format_user(u) for u in users]

    async def get_user_by_uid(self, uid: str) -> dict | None:
        user = await self.user_collection.find_one({"id": uid})
        return self._format_user(user) if user else None

    async def update_user(self, uid: str, update_data: dict) -> dict | None:
        db_update = update_data.copy()
        if "role" in db_update and isinstance(db_update["role"], str):
            db_update["role"] = db_update["role"].capitalize()
        
        user = await self.user_collection.find_one_and_update(
            {"id": uid},
            {"$set": db_update},
            return_document=ReturnDocument.AFTER
        )
        return self._format_user(user) if user else None

    async def delete_user(self, uid: str) -> bool:
        result = await self.user_collection.delete_one({"id": uid})
        return result.deleted_count > 0

