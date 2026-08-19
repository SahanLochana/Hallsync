from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Lecture(BaseModel):
    title: str
    lecturer_id: str
    hall_id: str
    start_time: datetime
    end_time: datetime


class LectureCreate(Lecture):
    description: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    capacity: int


class AvailabilityCheck(BaseModel):
    hall_id: str
    start_time: datetime
    end_time: datetime
    exclude_lecture_id: Optional[str] = None


class Timetable(BaseModel):
    timetable_id: str
    title: str
    department: str
    batch: str
    lectures: list[Lecture]
