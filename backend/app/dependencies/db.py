from fastapi import Depends
from app.core.database import Database, get_db
from app.services.user_service import UserService
from app.services.hall_service import HallService
from app.services.timetable_service import TimetableService
from app.services.notification_service import NotificationService
from app.repositories.user_repo import UserRepo


def get_database() -> Database:
    return get_db()


def get_user_repo(db: Database = Depends(get_db)) -> UserRepo:
    return UserRepo(db)


def get_user_service(db: Database = Depends(get_db)) -> UserService:
    return UserService(db)


def get_hall_service(db: Database = Depends(get_db)) -> HallService:
    return HallService(db)


def get_timetable_service(db: Database = Depends(get_db)) -> TimetableService:
    return TimetableService(db)


def get_notification_service(db: Database = Depends(get_db)) -> NotificationService:
    return NotificationService(db)
