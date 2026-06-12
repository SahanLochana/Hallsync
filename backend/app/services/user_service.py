from app.repositories.user_repo import UserRepo


class UserService:
    def __init__(self):
        self.user_repo = UserRepo()

    async def get_users(self):
        return await self.user_repo.get_users()

    async def get_user(self, university_id: str):
        return await self.user_repo.get_user_by_university_id(university_id)

    async def update_user(self, university_id: str, update_data: dict):
        return await self.user_repo.update_user(university_id, update_data)

    async def delete_user(self, university_id: str):
        return await self.user_repo.delete_user(university_id)

    async def create_user(self, user_data: dict):
        return await self.user_repo.create_user(user_data)
