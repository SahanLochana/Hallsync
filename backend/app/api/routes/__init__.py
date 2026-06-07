# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from .timetable_routes import router as timetable_router
from .lecture_routes import router as lecture_router

router = APIRouter()

router.include_router(timetable_router, prefix="/timetables", tags=["Timetables"])
router.include_router(lecture_router)
