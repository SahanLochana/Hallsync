from pymongo import ReturnDocument
from app.core.database import Database
from pymongo.errors import DuplicateKeyError
from typing import Optional


class ModuleRepo:
    def __init__(self, db: Database):
        self.db = db
        self.module_collection = self.db.get_collection("modules")

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _format_module(self, doc: dict) -> dict:
        """Strip MongoDB _id and normalise field names for the API schema."""
        doc = doc.copy()
        doc.pop("_id", None)
        return doc

    # ── Reads ──────────────────────────────────────────────────────────────────

    async def get_modules(self) -> list[dict]:
        cursor = self.module_collection.find()
        modules = await cursor.to_list()
        return [self._format_module(m) for m in modules]

    async def get_module_by_id(self, module_id: str) -> Optional[dict]:
        module = await self.module_collection.find_one({"module_id": module_id})
        return self._format_module(module) if module else None

    # ── Writes ─────────────────────────────────────────────────────────────────

    async def create_module(self, module_data: dict) -> dict:
        """Insert a new module document. Raises ValueError on duplicate module_id."""
        db_module = module_data.copy()
        try:
            await self.module_collection.insert_one(db_module)
        except DuplicateKeyError:
            raise ValueError(
                f"Module with module_id '{db_module.get('module_id')}' already exists."
            )
        return self._format_module(db_module)

    async def update_module(
        self, module_id: str, update_data: dict
    ) -> Optional[dict]:
        module = await self.module_collection.find_one_and_update(
            {"module_id": module_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_module(module) if module else None

    async def delete_module(self, module_id: str) -> bool:
        result = await self.module_collection.delete_one({"module_id": module_id})
        return result.deleted_count > 0
