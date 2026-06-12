from pydantic import BaseModel
from typing import Literal


class User(BaseModel):
    uid: str
    name: str
    email: str
    department: str
    faculty: str
    role: Literal["student", "lecturer", "admin"]
    academicYear: str | None = None


class UsersResponse(BaseModel):
    response: list[User]


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department: str | None = None
    faculty: str | None = None
    role: Literal["student", "lecturer", "admin"] | None = None
    academicYear: str | None = None

