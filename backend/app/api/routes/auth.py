from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user_schema import (
    LoginRequest,
    LoginResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
)
from app.services.user_service import UserService
from app.dependencies.db import get_user_service
from app.core.security import create_access_token


router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    user_service: UserService = Depends(get_user_service),
):
    """
    Login endpoint using Auth0.
    Validates user credentials against Auth0 and returns JWT token.
    """
    # Validate credentials
    user = await user_service.authenticate_user(
        login_data.username, login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Generate a token containing their identity and role
    token_data = {"sub": user["name"], "role": user["role"],"department": user["department"],
        "batch": user["academicYear"],"email": user["email"],}
    access_token = create_access_token(data=token_data)

    # Return the payload back to frontend
    return {
        "status": "success",       
        "token": access_token,
        "isFirstLogin": user.get("isFirstLogin", user.get("is_first_login", True)),
    }


@router.post("/change-password")
async def change_password(
    change_request: ChangePasswordRequest,
    user_service: UserService = Depends(get_user_service),
):
    """
    Change password endpoint for first-login password updates and in-app password changes.
    """
    identifier = (
        change_request.identifier or change_request.username or change_request.email
    )

    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="An identifier, username, or email is required",
        )

    success = await user_service.change_password(
        identifier,
        change_request.current_password,
        change_request.new_password,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect or user was not found",
        )

    return {"status": "success", "message": "Password updated successfully"}


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    user_service: UserService = Depends(get_user_service),
):
    success = await user_service.generate_and_save_otp(request.email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in our system",
        )
    return {"success": True, "message": "OTP sent successfully"}


@router.post("/verify-otp")
async def verify_otp(
    request: VerifyOTPRequest,
    user_service: UserService = Depends(get_user_service),
):
    is_valid = await user_service.verify_otp(request.email, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP"
        )

    return {"success": True, "token": request.otp, "message": "OTP verified"}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    user_service: UserService = Depends(get_user_service),
):

    success = await user_service.reset_password_with_otp(
        request.email, request.token, request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reset password. OTP might be expired.",
        )
    return {"success": True, "message": "Password reset successful"}

