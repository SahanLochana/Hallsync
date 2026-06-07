from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LectureCreate(BaseModel):
    title: str
    description: Optional[str] = None
    lecturer_id: str
    hall_id: str
    start_time: datetime
    end_time: datetime
    capacity: int

class AvailabilityCheck(BaseModel):
    hall_id: str
    start_time: datetime
    end_time: datetime
    exclude_lecture_id: Optional[str] = None