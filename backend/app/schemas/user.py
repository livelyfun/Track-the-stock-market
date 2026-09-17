from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    preferred_market: Optional[str] = "US"
    preferred_language: Optional[str] = "en"
    preferred_currency: Optional[str] = "USD"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    preferred_market: Optional[str] = "US"
    preferred_language: Optional[str] = "en"
    preferred_currency: Optional[str] = "USD"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPreferencesUpdate(BaseModel):
    preferred_market: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_currency: Optional[str] = None
    has_completed_onboarding: Optional[bool] = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    has_completed_onboarding: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
