from fastapi import APIRouter, HTTPException
from typing import List
from app.services.notification_service import NotificationService
from app.schemas.notification_schema import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])
notification_service = NotificationService()

@router.get("/{user_id}", response_model=List[Notification])
async def get_notifications(user_id: str):
    """
    Get all notifications for a specific user, ordered by newest first.
    """
    notifications = await notification_service.get_user_notifications(user_id)
    return notifications

@router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str):
    """
    Mark a notification as read.
    """
    success = await notification_service.mark_as_read(notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found or already read")
    return {"message": "Notification marked as read"}
