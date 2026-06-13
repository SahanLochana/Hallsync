from fastapi import APIRouter
from app.api.routes.timetable_routes import router as timetable_router
from app.api.routes.user_routes import router as user_router

api_router = APIRouter()

api_router.include_router(timetable_router, prefix="/timetables", tags=["Timetables"])

api_router.include_router(user_router, prefix="/users", tags=["Users"])
