from pymongo import ReturnDocument
from pymongo.errors import BulkWriteError, DuplicateKeyError
from app.core.database import Database
from app.core.config import settings
from typing import Optional
from app.core.security import get_password_hash


class UserRepo:
    def __init__(self):
        self.db = Database()
        self.user_collection = self.db.get_collection("users")

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

    async def get_user_by_university_id(self, university_id: str) -> Optional[dict]:
        user = await self.user_collection.find_one({"universityId": university_id})
        return self._format_user(user) if user else None

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        user = await self.user_collection.find_one({"email": email})
        return self._format_user(user) if user else None

    async def update_user(self, university_id: str, update_data: dict) -> Optional[dict]:
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
            
        if "password_hash" not in db_user:
            db_user["password_hash"] = get_password_hash("DefaultPassword123!")

        try:
            await self.user_collection.insert_one(db_user)
        except DuplicateKeyError:
            raise ValueError(
                f"User with universityId '{db_user.get('universityId')}' already exists."
            )

        return self._format_user(db_user)

    async def bulk_create_users(self, users: list[dict]) -> dict:
        """
        Bulk create users using insert_many.
        Returns { success: [...formatted docs], failed: [{index, universityId, reason}] }
        """
        if not users:
            return {"success": [], "failed": []}

        db_users = []
        for user_data in users:
            db_user = user_data.copy()
            if "role" in db_user and isinstance(db_user["role"], str):
                db_user["role"] = db_user["role"].capitalize()
            if "password_hash" not in db_user:
                db_user["password_hash"] = get_password_hash("DefaultPassword123!")
            db_users.append(db_user)

        success = []
        failed = []

        try:
            await self.user_collection.insert_many(db_users, ordered=False)
            for db_user in db_users:
                success.append(self._format_user(db_user))
        except BulkWriteError as bwe:
            write_errors = bwe.details.get("writeErrors", [])
            failed_indices = {}
            for err in write_errors:
                idx = err.get("index")
                if idx is not None:
                    failed_indices[idx] = err.get("errmsg", "Bulk write error")

            for idx, db_user in enumerate(db_users):
                if idx in failed_indices:
                    failed.append(
                        {
                            "index": idx,
                            "universityId": db_user.get("universityId", ""),
                            "reason": failed_indices[idx],
                        }
                    )
                else:
                    success.append(self._format_user(db_user))
        except Exception as exc:
            for idx, db_user in enumerate(db_users):
                failed.append(
                    {
                        "index": idx,
                        "universityId": db_user.get("universityId", ""),
                        "reason": str(exc),
                    }
                )

        return {"success": success, "failed": failed}
