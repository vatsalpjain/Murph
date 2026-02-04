"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class SignupRequest(BaseModel):
    """User registration with email/password"""
    email: EmailStr
    password: str = Field(min_length=8, description="Password (min 8 characters)")
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(pattern="^(student|teacher)$", description="User role: student or teacher")


class LoginRequest(BaseModel):
    """User login with email/password"""
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    """Google OAuth login with ID token"""
    google_token: str = Field(description="Google OAuth ID token")


class AuthResponse(BaseModel):
    """Authentication response with user data and tokens"""
    user: dict
    session: dict
    message: str


class UserResponse(BaseModel):
    """Current user profile response"""
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    wallet_address: Optional[str] = None


class LogoutResponse(BaseModel):
    """Logout response"""
    message: str


class RoleUpdateRequest(BaseModel):
    """Request to update user role"""
    new_role: str = Field(pattern="^(student|teacher)$")


# ============================================================================
# SESSION MODELS
# ============================================================================
class SessionCreateRequest(BaseModel):
    course_id: str
    student_id: str
    locked_amount: float = Field(gt=0, description="Amount to lock (e.g., $30)")


class SessionCreateResponse(BaseModel):
    session_id: str
    status: str
    locked_amount: float
    payment_tx_id: str
    created_at: datetime


class SessionStartRequest(BaseModel):
    session_id: str


class SessionCompleteRequest(BaseModel):
    session_id: str
    duration_seconds: int = Field(ge=0)


# Payment Models
class PaymentLockRequest(BaseModel):
    session_id: str
    student_id: str
    amount: float = Field(gt=0)


class PaymentChargeRequest(BaseModel):
    session_id: str
    student_id: str
    teacher_id: str
    amount: float = Field(gt=0)


class PaymentRefundRequest(BaseModel):
    session_id: str
    student_id: str
    amount: float = Field(gt=0)


class PaymentResponse(BaseModel):
    payment_id: str
    payment_type: str
    amount: float
    gateway_tx_id: str
    gateway_status: str
    created_at: datetime


# Session Status Response
class SessionStatusResponse(BaseModel):
    session_id: str
    course_id: str
    student_id: str
    teacher_id: str
    status: str
    locked_amount: float
    final_cost: float
    amount_paid: float
    amount_refunded: float
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration_seconds: int
    payment_tx_id: Optional[str]


# Wallet Models
class WalletBalanceResponse(BaseModel):
    user_id: str
    balance: float


class WalletDepositRequest(BaseModel):
    user_id: str
    amount: float = Field(gt=0, description="Amount to deposit")


class WalletDepositResponse(BaseModel):
    payment_id: str
    amount: float
    new_balance: float
    gateway_tx_id: str
    timestamp: datetime


# Video Session Models
class VideoSessionStartRequest(BaseModel):
    user_id: str
    video_id: Optional[str] = "default"


class VideoSessionStartResponse(BaseModel):
    session_id: str
    locked_amount: float
    start_time: datetime
    rate_per_second: float


class VideoSessionEndRequest(BaseModel):
    user_id: str


class VideoSessionEndResponse(BaseModel):
    session_id: str
    duration_seconds: int
    amount_charged: float
    refund: float
    final_balance: float
    ended_at: datetime
