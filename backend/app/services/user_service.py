from app.repositories.user_repo import UserRepo
from app.core.security import verify_password, get_password_hash
import random
from datetime import datetime, timedelta

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
    
    async def generate_and_save_otp(self, email:str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return False
        
        otp = str(random.randint(100000, 999999))
        expire_time = datetime.utcnow() + timedelta(minutes=10)

        await self.user_repo.update_user(user["universityId"], {
            "reset_otp": otp, 
            "reset_otp_expires": expire_time
        })

        print(f"OTP for {email} is { otp}")
        return True
    
    async def verify_otp(self, email:str, otp:str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return False
        
        if user["reset_otp"] == otp and user["reset_otp_expires"] > datetime.utcnow():
            return True
        return False
    
    async def reset_password_with_otp(self, email: str, otp: str, new_password: str):
        is_valid = await self.verify_otp(email, otp)
        if not is_valid:
            return False
            
        user = await self.user_repo.get_user_by_email(email)
        hashed_password = get_password_hash(new_password)
        
        
        await self.user_repo.update_user(user["universityId"], {
            "password_hash": hashed_password,
            "reset_otp": None,
            "reset_otp_expires": None
        })
        return True
        
    
