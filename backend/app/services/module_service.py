from app.repositories.module_repo import ModuleRepo
from app.core.database import Database
from typing import Optional


class ModuleService:
    def __init__(self, db: Database):
        self.db = db
        self.module_repo = ModuleRepo(db)

    async def get_modules(self) -> list[dict]:
        return await self.module_repo.get_modules()

    async def get_module(self, module_id: str) -> Optional[dict]:
        return await self.module_repo.get_module_by_id(module_id)

    async def create_module(self, module_data: dict) -> dict:
        return await self.module_repo.create_module(module_data)

    async def update_module(
        self, module_id: str, update_data: dict
    ) -> Optional[dict]:
        return await self.module_repo.update_module(module_id, update_data)

    async def delete_module(self, module_id: str) -> bool:
        return await self.module_repo.delete_module(module_id)
