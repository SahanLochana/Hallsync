from app.repositories.hall_repo import HallRepo
from typing import Optional

class HallService:
    def __init__(self):
        self.hall_repo = HallRepo()

    async def get_halls(self) -> list[dict]:
        return await self.hall_repo.get_halls()

    async def get_hall(self, hall_id: str) -> Optional[dict]:
        return await self.hall_repo.get_hall_by_id(hall_id)

    async def create_hall(self, hall_data: dict) -> dict:
        return await self.hall_repo.create_hall(hall_data)

    async def update_hall(self, hall_id: str, update_data: dict) -> Optional[dict]:
        return await self.hall_repo.update_hall(hall_id, update_data)

    async def delete_hall(self, hall_id: str) -> bool:
        return await self.hall_repo.delete_hall(hall_id)
