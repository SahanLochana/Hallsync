from fastapi import APIRouter
from app.api.routes.user_routes import router as user_router
from app.api.routes.hall_routes import router as hall_router
from app.api.routes.timetable_routes import router as timetable_router
from app.api.routes.lecture_routes import router as lecture_router
from app.api.routes.report_routes import router as report_routes
from app.api.routes.notification_routes import router as notification_router
from app.api.routes.websocket_routes import router as websocket_router
from app.api.routes.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(user_router, prefix="/users", tags=["Users"])
api_router.include_router(hall_router, prefix="/halls", tags=["Halls"])
api_router.include_router(timetable_router, prefix="/timetables", tags=["Timetables"])
api_router.include_router(lecture_router,prefix="/lectures", tags=["Lectures"])
api_router.include_router(report_routes, prefix="/reports", tags=["Reports"])
api_router.include_router(notification_router,prefix="/notifications", tags=["Notifications"])
api_router.include_router(websocket_router,prefix="/ws", tags=["WebSockets"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
