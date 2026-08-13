from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.schemas.admin_schema import AdminLoginRequest, AdminLoginResponse
from app.services.admin_service import AdminService
from app.dependencies.db import get_database
from app.core.security import create_access_token
import jwt
from app.core.config import settings

router = APIRouter()


def get_admin_service(db=Depends(get_database)) -> AdminService:
    return AdminService(db)


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    payload: AdminLoginRequest,
    service: AdminService = Depends(get_admin_service),
):
    admin_doc = await service.authenticate_admin(payload.admin_id, payload.password)
    if not admin_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin ID or password",
        )

    token = create_access_token(data={"sub": payload.admin_id, "role": "admin"})
    return AdminLoginResponse(token=token, message="Login successful")


@router.get("/verify-token")
async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )
        return {"valid": True, "admin_id": admin_id}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid"
        )
