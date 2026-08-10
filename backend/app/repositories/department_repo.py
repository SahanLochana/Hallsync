from typing import Optional
from app.core.database import Database


class DepartmentRepo:
    def __init__(self, db: Database):
        self.db = db
        self.collection = self.db.get_collection("departments")

    def _format_doc(self, doc: dict) -> dict:
        doc = doc.copy()
        if "_id" in doc:
            del doc["_id"]
        return doc

    async def get_departments(self) -> list[dict]:
        cursor = self.collection.find()
        departments = await cursor.to_list(length=100)
        return [self._format_doc(d) for d in departments]

    async def get_department_by_code(self, code: str) -> Optional[dict]:
        dept = await self.collection.find_one({"departmentCode": code.upper()})
        if not dept:
            # Fallback case-insensitive lookup if exact match fails
            dept = await self.collection.find_one(
                {"departmentCode": {"$regex": f"^{code}$", "$options": "i"}}
            )
        return self._format_doc(dept) if dept else None
