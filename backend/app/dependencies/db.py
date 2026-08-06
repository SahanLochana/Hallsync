from fastapi import Depends
from app.core.database import Database, get_database
from app.repositories.hall_repo import HallRepo
from app.repositories.user_repo import UserRepo
from app.repositories.timetable_repo import TimetableRepo
from app.services.hall_service import HallService
from app.services.user_service import UserService
from app.services.timetable_service import TimetableService
from app.services.notification_service import NotificationService


def get_db() -> Database:
    return get_database()


def get_hall_repo(db: Database = Depends(get_db)) -> HallRepo:
    return HallRepo(db)


def get_user_repo(db: Database = Depends(get_db)) -> UserRepo:
    return UserRepo(db)


def get_timetable_repo(db: Database = Depends(get_db)) -> TimetableRepo:
    return TimetableRepo(db)


def get_hall_service(db: Database = Depends(get_db)) -> HallService:
    return HallService(db)


def get_user_service(db: Database = Depends(get_db)) -> UserService:
    return UserService(db)


def get_timetable_service(db: Database = Depends(get_db)) -> TimetableService:
    return TimetableService(db)


def get_notification_service(db: Database = Depends(get_db)) -> NotificationService:
    return NotificationService(db)
