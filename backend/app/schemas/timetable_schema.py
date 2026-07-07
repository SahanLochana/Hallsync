from pydantic import BaseModel
from typing import List, Optional

class TimetableLecture(BaseModel):
    lec_id: str
    lectureName: str
    lecturerName: str
    day: str
    startHour: float
    endHour: float
    location: str

class TimetableBase(BaseModel):
    name: str
    department: str
    year: str
    lectures: List[TimetableLecture] = []

class TimetableCreate(TimetableBase):
    pass

class TimetableUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    lectures: Optional[List[TimetableLecture]] = None

class TimetableResponse(TimetableBase):
    id: str
    lastModified: str

class TimetablesListResponse(BaseModel):
    response: List[TimetableResponse]
