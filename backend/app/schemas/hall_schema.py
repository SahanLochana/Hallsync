from pydantic import BaseModel
from typing import Optional


class Hall(BaseModel):
    """Full hall representation returned by the API."""
    hallId: str
    name: str
    capacity: int
    availability: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HallsResponse(BaseModel):
    response: list[Hall]


class HallCreate(BaseModel):
    """Request body for creating a new hall."""
    hallId: str
    name: str
    capacity: int
    availability: bool = True
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HallUpdate(BaseModel):
    """All fields optional — only supplied fields are patched."""
    name: Optional[str] = None
    capacity: Optional[int] = None
    availability: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
