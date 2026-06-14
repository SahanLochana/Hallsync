from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class ReportCreate(BaseModel):
    title: str
    description: str
    type: str = Field(default="bug", description="Type of report: bug, feedback, issue")
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReportResponse(ReportCreate):
    id: str
