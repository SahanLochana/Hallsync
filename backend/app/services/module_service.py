from app.repositories.module_repo import ModuleRepo
from app.core.database import Database
from typing import Optional


class ModuleService:
    def __init__(self, db: Database):
        self.db = db
        self.module_repo = ModuleRepo(db)

    async def get_all_semesters(self) -> list[dict]:
        return await self.module_repo.get_all_semesters()

    async def get_semester(self, semester: str) -> Optional[dict]:
        return await self.module_repo.get_semester(semester)

    async def create_semester(self, data: dict) -> dict:
        return await self.module_repo.create_semester(data)

    async def update_semester(
        self, semester: str, update_data: dict
    ) -> Optional[dict]:
        return await self.module_repo.update_semester(semester, update_data)

    async def delete_semester(self, semester: str) -> bool:
        return await self.module_repo.delete_semester(semester)

    async def add_module_to_semester(
        self, semester: str, module_item: dict
    ) -> Optional[dict]:
        return await self.module_repo.add_module_to_semester(semester, module_item)

    async def remove_module_from_semester(
        self, semester: str, module_id: str
    ) -> Optional[dict]:
        return await self.module_repo.remove_module_from_semester(
            semester, module_id
        )
