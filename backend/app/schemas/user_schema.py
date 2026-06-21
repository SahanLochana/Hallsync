from pydantic import BaseModel
from typing import Literal


class User(BaseModel):
    universityId: str
    name: str
    email: str
    department: str
    faculty: str
    role: Literal["student", "lecturer", "admin"]
    academicYear: str | None = None


class UsersResponse(BaseModel):
    response: list[User]


class UserUpdate(BaseModel):
    universityId: str | None = None
    name: str | None = None
    email: str | None = None
    department: str | None = None
    faculty: str | None = None
    role: Literal["student", "lecturer", "admin"] | None = None
    academicYear: str | None = None


# ── Bulk import schemas ────────────────────────────────────────────────────────


class BulkUserRequest(BaseModel):
    """Request body for POST /api/users/bulk"""

    users: list[User]


class BulkFailedEntry(BaseModel):
    index: int  # 0-based index in the original request list
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
