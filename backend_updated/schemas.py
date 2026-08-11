from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# ---------- User ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "student" | "lecturer" | "admin"


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Hall ----------
class HallCreate(BaseModel):
    hall_code: str
    hall_name: str
    building: str
    capacity: int
    floor: int = 1
    seating_arrangements: int = 0
    is_available: str = "true"
    facilities: str = ""  # comma-separated, e.g. "wifi,projector,ac"
    address: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None


class HallOut(HallCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Timetable ----------
class TimetableCreate(BaseModel):
    hall_id: int
    lecturer_name: str
    module: str
    batch: Optional[str] = None
    date: date
    start_time: time
    end_time: time


class TimetableOut(TimetableCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Booking ----------
class BookingCreate(BaseModel):
    hall_id: int
    date: date
    start_time: time
    end_time: time
    purpose: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    user_id: int
    hall_id: int
    date: date
    start_time: time
    end_time: time
    purpose: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


# ---------- Notification ----------
class NotificationCreate(BaseModel):
    user_id: int
    message: str


class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
