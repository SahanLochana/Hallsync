from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    admin_id: str = Field(..., example="admin")
    password: str = Field(..., example="adminfoc")


class AdminLoginResponse(BaseModel):
    token: str
    message: str = "Login successful"
