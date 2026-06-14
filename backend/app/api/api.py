from fastapi import APIRouter
from app.api.routes.user_routes import router as user_router
from app.api.routes.hall_routes import router as hall_router

api_router = APIRouter()


api_router.include_router(user_router, prefix="/users", tags=["Users"])
api_router.include_router(hall_router, prefix="/halls", tags=["Halls"])
