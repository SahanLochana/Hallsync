# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from .timetable_routes import router as timetable_router
from .lecture_routes import router as lecture_router
from .report_routes import router as report_routes

router = APIRouter()

router.include_router(timetable_router, prefix="/timetables", tags=["Timetables"])
router.include_router(lecture_router)
router.include_router(report_routes, prefix="/reports", tags=["Reports"])
