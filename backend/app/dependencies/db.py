from app.services.department_service import DepartmentService
from fastapi import Depends
from app.core.database import Database, get_db
from app.services.user_service import UserService
from app.services.hall_service import HallService
from app.services.timetable_service import TimetableService
from app.services.notification_service import NotificationService
from app.services.module_service import ModuleService
from app.repositories.user_repo import UserRepo
from app.services.department_service import DepartmentService


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


def get_module_service(db: Database = Depends(get_db)) -> ModuleService:
    return ModuleService(db)


def get_department_service(db: Database = Depends(get_db)) -> DepartmentService:
    return DepartmentService(db)


def get_admin_service(db: Database = Depends(get_db)):
    from app.services.admin_service import AdminService

    return AdminService(db)
