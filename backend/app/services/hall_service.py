from app.repositories.hall_repo import HallRepo
from app.core.database import Database
from typing import Optional
from datetime import datetime


class HallService:
    def __init__(self, db: Database):
        self.db = db
        self.hall_repo = HallRepo(db)
        self.lectures_collection = self.db.get_collection("lectures")

    async def get_halls(self, query: Optional[dict] = None) -> list[dict]:
        return await self.hall_repo.get_halls(query)

    async def get_halls_with_status(
        self,
        search: Optional[str] = None,
        available_only: Optional[bool] = None,
        min_capacity: Optional[int] = None,
        amenity: Optional[str] = None,
    ) -> list[dict]:
        halls = await self.hall_repo.get_halls()
        now = datetime.utcnow()

        # Fetch today's lectures from DB
        cursor = self.lectures_collection.find()
        all_lectures = await cursor.to_list()

        result = []
        for hall in halls:
            hall_name = hall.get("name", "").strip().lower()
            hall_id = hall.get("hallId", "").strip().lower()

            # Filter by search string
            if search:
                s = search.strip().lower()
                b = hall.get("building", "").strip().lower()
                if s not in hall_name and s not in hall_id and s not in b:
                    continue

            # Filter by min capacity
            if min_capacity is not None and hall.get("capacity", 0) < min_capacity:
                continue

            # Filter by amenity
            if amenity:
                amenities = [a.lower() for a in hall.get("amenities", [])]
                if amenity.strip().lower() not in amenities:
                    continue

            # Match lectures for this hall (by hall_id or venue name)
            matching_lectures = []
            for lec in all_lectures:
                lec_venue = str(lec.get("hall_id", "")).strip().lower()
                if lec_venue == hall_id or lec_venue == hall_name:
                    matching_lectures.append(lec)

            # Find ongoing lecture
            current_lec = None
            next_lec = None
            next_lec_time = None

            for lec in matching_lectures:
                s_time = lec.get("start_time")
                e_time = lec.get("end_time")

                if isinstance(s_time, str):
                    try:
                        s_time = datetime.fromisoformat(s_time.replace("Z", "+00:00"))
                    except Exception:
                        s_time = None
                if isinstance(e_time, str):
                    try:
                        e_time = datetime.fromisoformat(e_time.replace("Z", "+00:00"))
                    except Exception:
                        e_time = None

                if s_time and e_time:
                    # Check if currently active
                    if s_time <= now <= e_time:
                        current_lec = lec.get("title", "Lecture in Progress")
                    elif s_time > now:
                        if next_lec is None or s_time < next_lec.get("_start_time", datetime.max):
                            next_lec = lec
                            next_lec["_start_time"] = s_time
                            next_lec_time = f"{s_time.strftime('%H:%M')} - {e_time.strftime('%H:%M')}"

            is_occupied = (current_lec is not None) or (not hall.get("availability", True))

            if available_only and is_occupied:
                continue

            hall["is_occupied"] = is_occupied
            hall["current_lecture"] = current_lec
            hall["next_lecture"] = next_lec.get("title") if next_lec else None
            hall["next_lecture_time"] = next_lec_time

            result.append(hall)

        return result

    async def get_hall_schedule(self, hall_id: str) -> list[dict]:
        hall = await self.hall_repo.get_hall_by_id(hall_id)
        if not hall:
            return []

        hall_name = hall.get("name", "").strip().lower()
        h_id = hall_id.strip().lower()

        cursor = self.lectures_collection.find()
        all_lectures = await cursor.to_list()

        matched = []
        for lec in all_lectures:
            lec_venue = str(lec.get("hall_id", "")).strip().lower()
            if lec_venue == h_id or lec_venue == hall_name:
                lec["_id"] = str(lec["_id"])
                matched.append(lec)

        # Sort by start_time
        matched.sort(key=lambda x: str(x.get("start_time")))
        return matched

    async def get_hall(self, hall_id: str) -> Optional[dict]:
        return await self.hall_repo.get_hall_by_id(hall_id)

    async def create_hall(self, hall_data: dict) -> dict:
        return await self.hall_repo.create_hall(hall_data)

    async def update_hall(self, hall_id: str, update_data: dict) -> Optional[dict]:
        return await self.hall_repo.update_hall(hall_id, update_data)

    async def delete_hall(self, hall_id: str) -> bool:
        return await self.hall_repo.delete_hall(hall_id)

