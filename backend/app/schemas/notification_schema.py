from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    recipient_user_id: str
    title: str
    message: str
    related_lecture_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(NotificationCreate):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
