from pymongo import ReturnDocument
from app.core.database import Database
from bson import ObjectId
from typing import Optional


class TimetableRepo:
    def __init__(self, db: Database):
        self.db = db
        self.timetables_collection = self.db.get_collection("timetables")

    def _format_timetable(self, doc: dict) -> dict:
        """Strip MongoDB _id and convert it to string id, with backward compatibility for lectures."""
        doc = doc.copy()
        doc["id"] = str(doc["_id"])
        del doc["_id"]

        # Backward compatibility: Map legacy "id" inside lectures to "lec_id"
        if "lectures" in doc and isinstance(doc["lectures"], list):
            formatted_lectures = []
            for lec in doc["lectures"]:
                if isinstance(lec, dict):
                    formatted_lec = lec.copy()
                    if "id" in formatted_lec and "lec_id" not in formatted_lec:
                        formatted_lec["lec_id"] = formatted_lec["id"]
                        del formatted_lec["id"]
                    formatted_lectures.append(formatted_lec)
                else:
                    formatted_lectures.append(lec)
            doc["lectures"] = formatted_lectures
        return doc

    async def get_timetables(self) -> list[dict]:
        cursor = self.timetables_collection.find(
            {},
            {
                "_id": 1,
                "timetable_id": 1,
                "name": 1,
                "department": 1,
                "year": 1,
                "lastModified": 1,
            },
        )
        timetables = await cursor.to_list()
        return [self._format_timetable(t) for t in timetables]

    async def get_timetable_by_id(self, timetable_id: str) -> Optional[dict]:
        try:
            obj_id = ObjectId(timetable_id)
        except Exception:
            return None
        timetable = await self.timetables_collection.find_one({"_id": obj_id})
        return self._format_timetable(timetable) if timetable else None

    async def create_timetable(self, timetable_data: dict) -> dict:
        db_timetable = timetable_data.copy()
        await self.timetables_collection.insert_one(db_timetable)
        return self._format_timetable(db_timetable)

    async def update_timetable(
        self, timetable_id: str, update_data: dict
    ) -> Optional[dict]:
        try:
            obj_id = ObjectId(timetable_id)
        except Exception:
            return None
        timetable = await self.timetables_collection.find_one_and_update(
            {"_id": obj_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_timetable(timetable) if timetable else None

    async def delete_timetable(self, timetable_id: str) -> bool:
        try:
            obj_id = ObjectId(timetable_id)
        except Exception:
            return False
        result = await self.timetables_collection.delete_one({"_id": obj_id})
        return result.deleted_count > 0
