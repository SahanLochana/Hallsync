from typing import Literal
from pydantic import BaseModel, EmailStr

#what flutter sends to fastAPI
class LoginRequest(BaseModel):
    username: str
    password: str

#what fastAPI sends to flutter upon success
class LoginResponse(BaseModel):
    status: str
    username: str
    email: EmailStr
    role: Literal["student",  "lecturer", "admin"]
    token: str
    isFirstLogin: bool

class ChangePasswordRequest(BaseModel):
    username: str
    current_password: str
    new_password: str