from app.repositories.user_repo import UserRepo
from app.core.security import verify_password, get_password_hash

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

    async def bulk_create_users(self, users: list[dict]) -> dict:
        return await self.user_repo.bulk_create_users(users)

    async def authenticate_user(self, email: str, password: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.get("password_hash", "")):
            return None
        return user

    async def update_user_password(self, email: str, new_password: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return False
        hashed_password = get_password_hash(new_password)
        updated = await self.user_repo.update_user(user["universityId"], {"password_hash": hashed_password})
        return bool(updated)
