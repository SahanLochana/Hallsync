from app.repositories.user_repo import UserRepo


class UserService:
    def __init__(self):
        self.user_repo = UserRepo()

    async def get_users(self):
        return await self.user_repo.get_users()

    async def get_user(self, uid: str):
        return await self.user_repo.get_user_by_uid(uid)

    async def update_user(self, uid: str, update_data: dict):
        return await self.user_repo.update_user(uid, update_data)

    async def delete_user(self, uid: str):
        return await self.user_repo.delete_user(uid)

