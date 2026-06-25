from app.core.database import notifications_collection
from app.repositories.user_repo import UserRepo
from app.schemas.notification_schema import NotificationCreate
from app.core.websocket_manager import manager
from typing import List
import traceback

class NotificationService:
    def __init__(self):
        self.user_repo = UserRepo()

    async def create_lecture_notifications(self, lecture_id: str, lecturer_name: str, lecture_title: str, department: str):
        import re
        try:
            # Normalize strings for robust matching (e.g. "Computing and Information Systems" vs "Computing & Information Systems (CIS)")
            def normalize_dept(d):
                if not d: return ""
                d = d.lower().replace("&", "and")
                d = re.sub(r'\s*\([^)]*\)', '', d) # remove (CIS) or (SE)
                return d.strip()

            norm_dept = normalize_dept(department)

            # Query all students in the same department
            users = await self.user_repo.get_users()
            target_students = [
                u for u in users 
                if u.get("role", "").lower() == "student" and normalize_dept(u.get("department")) == norm_dept
            ]

            if not target_students:
                return 0

            notifications = []
            for student in target_students:
                notif = NotificationCreate(
                    recipient_user_id=student.get("email", ""),
                    title="New Lecture Available",
                    message=f"Lecturer {lecturer_name} has created a new lecture: {lecture_title}",
                    related_lecture_id=lecture_id
                )
                notifications.append(notif.model_dump())

            if notifications:
                result = await notifications_collection.insert_many(notifications)
                # Map inserted IDs back to the dicts so we can send complete payload
                for i, notif in enumerate(notifications):
                    notif["_id"] = str(result.inserted_ids[i])
                    # Send via WebSocket
                    await manager.send_personal_message(notif, notif["recipient_user_id"])
            
            return len(notifications)
        except Exception as e:
            print(f"Error creating notifications: {e}")
            traceback.print_exc()
            return 0

    async def get_user_notifications(self, user_id: str) -> List[dict]:
        cursor = notifications_collection.find({"recipient_user_id": user_id}).sort("created_at", -1).limit(50)
        notifications = await cursor.to_list(length=50)
        for n in notifications:
            n["_id"] = str(n["_id"])
        return notifications

    async def mark_as_read(self, notification_id: str) -> bool:
        from bson import ObjectId
        try:
            result = await notifications_collection.update_one(
                {"_id": ObjectId(notification_id)},
                {"$set": {"is_read": True}}
            )
            return result.modified_count > 0
        except Exception:
            return False
