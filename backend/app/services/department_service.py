from typing import Optional
from app.core.database import Database
from app.repositories.department_repo import DepartmentRepo


class DepartmentService:
    def __init__(self, db: Database):
        self.repo = DepartmentRepo(db)

    async def get_departments(self) -> list[dict]:
        return await self.repo.get_departments()

    async def get_department_by_code(self, code: str) -> Optional[dict]:
        return await self.repo.get_department_by_code(code)
