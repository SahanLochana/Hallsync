# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from api.routes.timetable_routes import router as timetable_router

api_router = APIRouter()

api_router.include_router(
    timetable_router,
    prefix="/timetables",
    tags=["Timetables"]
)