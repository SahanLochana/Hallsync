from pymongo import ReturnDocument
from app.core.database import Database
from app.core.config import settings
from pymongo.errors import DuplicateKeyError


class HallRepo:
    def __init__(self):
        self.db = Database()
        self.hall_collection = self.db.get_collection(settings.HALL_COLLECTION)

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _format_hall(self, doc: dict) -> dict:
        """Strip MongoDB _id and normalise field names for the API schema."""
        doc = doc.copy()
        doc.pop("_id", None)
        return doc

    # ── Reads ──────────────────────────────────────────────────────────────────

    async def get_halls(self) -> list[dict]:
        cursor = self.hall_collection.find()
        halls = await cursor.to_list(length=1000)
        return [self._format_hall(h) for h in halls]

    async def get_hall_by_id(self, hall_id: str) -> dict | None:
        hall = await self.hall_collection.find_one({"hallId": hall_id})
        return self._format_hall(hall) if hall else None

    # ── Writes ─────────────────────────────────────────────────────────────────

    async def create_hall(self, hall_data: dict) -> dict:
        """Insert a new hall document. Raises ValueError on duplicate hallId."""

        db_hall = hall_data.copy()
        try:
            await self.hall_collection.insert_one(db_hall)
        except DuplicateKeyError:
            raise ValueError(
                f"Hall with hallId '{db_hall.get('hallId')}' already exists."
            )
        return self._format_hall(db_hall)

    async def update_hall(self, hall_id: str, update_data: dict) -> dict | None:
        hall = await self.hall_collection.find_one_and_update(
            {"hallId": hall_id},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER,
        )
        return self._format_hall(hall) if hall else None

    async def delete_hall(self, hall_id: str) -> bool:
        result = await self.hall_collection.delete_one({"hallId": hall_id})
        return result.deleted_count > 0

    # ── Index ──────────────────────────────────────────────────────────────────

    async def create_index(self):
        await self.hall_collection.create_index("hallId", unique=True)
