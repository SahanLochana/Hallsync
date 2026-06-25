from pydantic import BaseModel
from typing import Literal, Optional


class User(BaseModel):
    universityId: str
    name: str
    email: str
    department: str
    faculty: str
    role: Literal["student", "lecturer", "admin"]
    academicYear: Optional[str] = None


class UsersResponse(BaseModel):
    response: list[User]


class UserUpdate(BaseModel):
    universityId: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    faculty: Optional[str] = None
    role: Optional[Literal["student", "lecturer", "admin"]] = None
    academicYear: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    status: str
    username: str
    email: str
    department: str
    batch: str
    role: str
    token: str
    isFirstLogin: bool


class ChangePasswordRequest(BaseModel):
    username: str
    current_password: str
    new_password: str


# ── Bulk import schemas ────────────────────────────────────────────────────────

class BulkUserRequest(BaseModel):
    """Request body for POST /api/users/bulk"""
    users: list[User]


class BulkFailedEntry(BaseModel):
    index: int
    universityId: str
    reason: str


class BulkImportSummary(BaseModel):
    total: int
    succeeded: int
    failed: int


class BulkImportResponse(BaseModel):
    success: list[User]
    failed: list[BulkFailedEntry]
    summary: BulkImportSummary