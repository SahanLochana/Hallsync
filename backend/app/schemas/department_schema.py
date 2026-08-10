from typing import List, Optional
from pydantic import BaseModel, Field


class LectureItem(BaseModel):
    semester: int
    courseCode: str
    courseTitle: str
    credits: Optional[int] = None
    type: str
    nonGpa: bool = False


class Department(BaseModel):
    departmentCode: str
    departmentName: str
    degreePrograms: List[str] = Field(default_factory=list)
    lectures: List[LectureItem] = Field(default_factory=list)


class DepartmentsResponse(BaseModel):
    response: List[Department]
