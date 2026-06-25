from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import LoginRequest, LoginResponse, ChangePasswordRequest, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
from app.services.user_service import UserService
from app.core.security import create_access_token



router = APIRouter()
user_service = UserService()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Login endpoint using Auth0.
    Validates user credentials against Auth0 and returns JWT token.
    """
    # Validate credentials
    user = await user_service.authenticate_user(login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Generate a token containing their identity and role
    token_data = {"sub": user["email"], "role": user["role"]}
    access_token = create_access_token(data=token_data)
    
    # Return the payload back to frontend
    return {
        "status": "success",
        "username": user.get("name") or user.get("email") or "Unknown",
        "email": user["email"],
        "department": user.get("department") or "Unknown",
        "batch": user.get("academicYear") or "Unknown",
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
    # Validate user and update password
    user = await user_service.authenticate_user(change_request.username, change_request.current_password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update the password
    success = await user_service.update_user_password(change_request.username, change_request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"status": "success", "message": "Password updated successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    success = await user_service.generate_and_save_otp(request.email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in our system"
        )
    return {"success": True, "message": "OTP sent successfully"}

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    is_valid = await user_service.verify_otp(request.email, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
   
    return {"success": True, "token": request.otp, "message": "OTP verified"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):

    success = await user_service.reset_password_with_otp(
        request.email, 
        request.token, 
        request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reset password. OTP might be expired."
        )
    return {"success": True, "message": "Password reset successful"}