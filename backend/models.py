"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# Session Models
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
