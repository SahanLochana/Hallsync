from app.repositories.user_repo import UserRepo
from app.core.database import Database
from app.core.security import verify_password, get_password_hash
from app.services.email_service import EmailService
import random
from datetime import datetime, timedelta


class UserService:
    def __init__(self, db: Database):
        self.db = db
        self.user_repo = UserRepo(db)

    async def get_users(self):
        return await self.user_repo.get_users()

    async def get_user(self, university_id: str):
        return await self.user_repo.get_user_by_university_id(university_id)

    async def update_user(self, university_id: str, update_data: dict):
        return await self.user_repo.update_user(university_id, update_data)

    async def delete_user(self, university_id: str):
        return await self.user_repo.delete_user(university_id)

    async def create_user(self, user_data: dict):
        user, plain_password = await self.user_repo.create_user(user_data)
        print(plain_password)
        if plain_password and user.get("email"):
            email_service = EmailService()
            email_service.send_welcome_email(
                to_email=user["email"],
                name=user.get("name", "User"),
                username=user["email"],
                password=plain_password,
            )
        return user

    async def bulk_create_users(self, users: list[dict]) -> dict:
        result = await self.user_repo.bulk_create_users(users)
        success_users = result.get("success", [])
        passwords = result.get("passwords", {})

        email_service = EmailService()
        for u in success_users:
            uni_id = u.get("universityId", "")
            plain_pwd = passwords.get(uni_id)
            if plain_pwd and u.get("email"):
                try:
                    email_service.send_welcome_email(
                        to_email=u["email"],
                        name=u.get("name", "User"),
                        username=u["email"],
                        password=plain_pwd,
                    )
                except Exception as e:
                    print(f"Failed to send welcome email to {u.get('email')}: {e}")

        return {"success": success_users, "failed": result.get("failed", [])}

    async def authenticate_user(self, email: str, password: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.get("password_hash", "")):
            return None
        return user

    async def change_password(
        self, identifier: str, current_password: str, new_password: str
    ):
        user = await self.user_repo.get_user_by_identifier(identifier)
        if not user:
            return False

        if not verify_password(current_password, user.get("password_hash", "")):
            return False

        hashed_password = get_password_hash(new_password)
        updated = await self.user_repo.update_user(
            user["universityId"],
            {
                "password_hash": hashed_password,
                "is_first_login": False,
                "isFirstLogin": False,
            },
        )
        return bool(updated)

    async def update_user_password(self, email: str, new_password: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return False
        hashed_password = get_password_hash(new_password)
        updated = await self.user_repo.update_user(
            user["universityId"],
            {
                "password_hash": hashed_password,
                "is_first_login": False,
                "isFirstLogin": False,
            },
        )
        return bool(updated)

    async def generate_and_save_otp(self, email: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return False

        otp = str(random.randint(100000, 999999))
        # pyrefly: ignore [deprecated]
        expire_time = datetime.utcnow() + timedelta(minutes=10)

        await self.user_repo.update_user(
            user["universityId"], {"reset_otp": otp, "reset_otp_expires": expire_time}
        )

        email_service = EmailService()
        sent = email_service.send_otp(email, user.get("name", "User"), otp)
        return sent

    async def verify_otp(self, email: str, otp: str):
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
        if user is not None:
            hashed_password = get_password_hash(new_password)

            await self.user_repo.update_user(
                user["universityId"],
                {
                    "password_hash": hashed_password,
                    "reset_otp": None,
                    "reset_otp_expires": None,
                    "is_first_login": False,
                    "isFirstLogin": False,
                },
            )
            return True
        return False
