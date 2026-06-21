from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import LoginRequest, LoginResponse, ChangePasswordRequest
from app.services.user_service import authenticate_user, update_user_password
from app.core.security import create_access_token

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # 1. Authenticate user against MongoDB
    user = await authenticate_user(login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # 2. Generate a token containing their identity and role
    token_data = {"sub": user["username"], "role": user["role"]}
    access_token = create_access_token(data=token_data)
    
    # 3. Return the payload back to Flutter
    return {
        "status": "success",
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],  # 'student' or 'lecturer'
        "token": access_token,
        "isFirstLogin": user.get("isFirstLogin", True)  
    }

@router.post("/change-password")
async def change_password(change_request: ChangePasswordRequest):
    # 1. Authenticate user with current password
    user = await authenticate_user(change_request.username, change_request.current_password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # 2. Update the password in the database
    success = await update_user_password(change_request.username, change_request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"status": "success", "message": "Password updated successfully"}