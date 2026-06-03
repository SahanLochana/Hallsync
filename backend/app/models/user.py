from pydantic import EmailStr
from enum import Enum
from .common import MongoBaseModel


class UserRole(str, Enum):
    ADMIN = "admin"
    LECTURER = "lecturer"
    STUDENT = "student"
    STAFF = "staff"


class User(MongoBaseModel):
    full_name: str
    email: EmailStr
    password_hash: str
    role: UserRole