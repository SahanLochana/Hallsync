from app.repositories.timetable_repo import TimetableRepo
from app.core.database import Database
from datetime import datetime


class TimetableService:
    def __init__(self, db: Database):
        self.db = db
        self.timetable_repo = TimetableRepo(db)

    async def get_timetables(self):
        return await self.timetable_repo.get_timetables()

    async def get_timetable(self, timetable_id: str):
        return await self.timetable_repo.get_timetable_by_id(timetable_id)

    async def create_timetable(self, timetable_data: dict):
        now_str = datetime.utcnow().strftime("%Y.%m.%d  %I:%M%p").lower()
        # format hour without leading zero: e.g. "  09:10am" -> "  9:10am"
        now_str = now_str.replace("  0", "  ")
        timetable_data["lastModified"] = now_str

        # Auto-generate timetable_id from department and year
        dep = timetable_data.get("department") or ""
        yr = timetable_data.get("year") or ""
        import re

        dep_slug = re.sub(r"[^a-zA-Z0-9]+", "_", dep.lower()).strip("_")
        year_slug = re.sub(r"[^a-zA-Z0-9]+", "_", yr.lower()).strip("_")
        timetable_data["timetable_id"] = f"{dep_slug}_{year_slug}"

        return await self.timetable_repo.create_timetable(timetable_data)

    async def update_timetable(self, timetable_id: str, update_data: dict):
        now_str = datetime.utcnow().strftime("%Y.%m.%d  %I:%M%p").lower()
        now_str = now_str.replace("  0", "  ")
        update_data["lastModified"] = now_str

        # If department or year is updated, regenerate timetable_id
        if "department" in update_data or "year" in update_data:
            current = await self.timetable_repo.get_timetable_by_id(timetable_id)
            if current:
                dep = update_data.get("department")
                if dep is None:
                    dep = current.get("department") or ""
                yr = update_data.get("year")
                if yr is None:
                    yr = current.get("year") or ""
                import re

                dep_slug = re.sub(r"[^a-zA-Z0-9]+", "_", dep.lower()).strip("_")
                year_slug = re.sub(r"[^a-zA-Z0-9]+", "_", yr.lower()).strip("_")
                update_data["timetable_id"] = f"{dep_slug}_{year_slug}"

        return await self.timetable_repo.update_timetable(timetable_id, update_data)

    async def delete_timetable(self, timetable_id: str):
        return await self.timetable_repo.delete_timetable(timetable_id)
