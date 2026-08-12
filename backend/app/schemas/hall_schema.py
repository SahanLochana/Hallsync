from pydantic import BaseModel
from typing import Optional, List


class Hall(BaseModel):
    """Full hall representation returned by the API."""

    hallId: str
    name: str
    capacity: int
    availability: bool = True
    building: Optional[str] = "Faculty of Computing"
    floor: Optional[str] = "Ground Floor"
    type: Optional[str] = "Lecture Hall"
    amenities: Optional[List[str]] = ["Projector", "AC", "Sound System"]
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Dynamic status fields populated by live status queries
    is_occupied: Optional[bool] = False
    current_lecture: Optional[str] = None
    next_lecture: Optional[str] = None
    next_lecture_time: Optional[str] = None


class HallsResponse(BaseModel):
    response: list[Hall]


class HallCreate(BaseModel):
    """Request body for creating a new hall."""

    hallId: str
    name: str
    capacity: int
    availability: bool = True
    building: Optional[str] = "Faculty of Computing"
    floor: Optional[str] = "Ground Floor"
    type: Optional[str] = "Lecture Hall"
    amenities: Optional[List[str]] = ["Projector", "AC", "Sound System"]
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HallUpdate(BaseModel):
    """All fields optional — only supplied fields are patched."""

    name: Optional[str] = None
    capacity: Optional[int] = None
    availability: Optional[bool] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    type: Optional[str] = None
    amenities: Optional[List[str]] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

