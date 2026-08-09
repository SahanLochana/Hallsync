from pymongo import ReturnDocument
from app.core.database import Database
from pymongo.errors import DuplicateKeyError
from typing import Optional


class ModuleRepo:
    def __init__(self, db: Database):
        self.db = db
        self.module_collection = self.db.get_collection("modules")

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _format_doc(self, doc: dict) -> dict:
        """Strip MongoDB _id from document."""
        doc = doc.copy()
        doc.pop("_id", None)
        return doc

    # ── Reads ──────────────────────────────────────────────────────────────────

    async def get_all_semesters(self) -> list[dict]:
        cursor = self.module_collection.find()
        docs = await cursor.to_list()
        return [self._format_doc(d) for d in docs]

    async def get_semester(self, semester: str) -> Optional[dict]:
        doc = await self.module_collection.find_one({"semester": semester})
        return self._format_doc(doc) if doc else None

    # ── Writes ─────────────────────────────────────────────────────────────────

    async def create_semester(self, data: dict) -> dict:
        """Insert a new semester document. Raises ValueError on duplicate semester."""
        db_doc = data.copy()
        try:
            await self.module_collection.insert_one(db_doc)
        except DuplicateKeyError:
            raise ValueError(
                f"Semester document for '{db_doc.get('semester')}' already exists."
            )
        return self._format_doc(db_doc)

    async def update_semester(
        self, semester: str, update_data: dict
    ) -> Optional[dict]:
        doc = await self.module_collection.find_one_and_update(
            {"semester": semester},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_doc(doc) if doc else None

    async def delete_semester(self, semester: str) -> bool:
        result = await self.module_collection.delete_one({"semester": semester})
        return result.deleted_count > 0

    async def add_module_to_semester(
        self, semester: str, module_item: dict
    ) -> Optional[dict]:
        """Push a module item into the modules array for a semester."""
        # First ensure no duplicate module_id within the semester
        existing = await self.module_collection.find_one(
            {"semester": semester, "modules.module_id": module_item["module_id"]}
        )
        if existing:
            raise ValueError(
                f"Module with module_id '{module_item['module_id']}' already exists in '{semester}'."
            )

        doc = await self.module_collection.find_one_and_update(
            {"semester": semester},
            {"$push": {"modules": module_item}},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_doc(doc) if doc else None

    async def remove_module_from_semester(
        self, semester: str, module_id: str
    ) -> Optional[dict]:
        """Pull a module item by module_id from the modules array for a semester."""
        doc = await self.module_collection.find_one_and_update(
            {"semester": semester},
            {"$pull": {"modules": {"module_id": module_id}}},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_doc(doc) if doc else None
