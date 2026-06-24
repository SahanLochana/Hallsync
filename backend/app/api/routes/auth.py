from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import LoginRequest, LoginResponse, ChangePasswordRequest
from app.services.user_service import authenticate_user, update_user_password
from app.core.security import create_access_token

"""
Auth Routes — Authentication with Auth0
This module handles authentication endpoints using Auth0 as the identity provider.
MongoDB has been removed in favor of Auth0 for user management.
"""

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint using Auth0.
    Validates user credentials against Auth0 and returns JWT token.
    """
    # TODO: Replace with Auth0 authentication flow
    # Validate token from Auth0 and retrieve user info
    user = await authenticate_user(login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate a token containing their identity and role
    token_data = {"sub": user["username"], "role": user["role"]}
    access_token = create_access_token(data=token_data)
    
    # Return the payload back to frontend
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
    """
    Change password endpoint using Auth0.
    Password changes should be handled through Auth0 Management API.
    """
    # TODO: Replace with Auth0 Management API password reset
    # Validate user and update password through Auth0
    user = await authenticate_user(change_request.username, change_request.current_password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update the password through Auth0
    success = await update_user_password(change_request.username, change_request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"status": "success", "message": "Password updated successfully"}