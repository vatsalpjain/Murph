from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    SessionCreateRequest, SessionCreateResponse, SessionStartRequest,
    SessionCompleteRequest, PaymentResponse, SessionStatusResponse
)
from payment_service import SessionService, PaymentService

app = FastAPI(title="Murph Learning Platform API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with uv"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/data")
async def get_data():
    return {
        "data": [
            {"id": 1, "name": "Item 1"},
            {"id": 2, "name": "Item 2"}
        ]
    }

@app.post("/api/data")
async def create_data(item: dict):
    return {"message": "Data created", "item": item}


# ============================================================================
# SESSION ENDPOINTS
# ============================================================================

@app.post("/api/sessions/create", response_model=SessionCreateResponse)
async def create_session(request: SessionCreateRequest):
    """
    Create new session with locked payment
    Locks initial payment amount and creates session record
    """
    try:
        session = await SessionService.create_session(
            course_id=request.course_id,
            student_id=request.student_id,
            locked_amount=request.locked_amount
        )
        
        return SessionCreateResponse(
            session_id=session["id"],
            status=session["status"],
            locked_amount=session["locked_amount"],
            payment_tx_id=session["payment_tx_id"],
            created_at=session["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/sessions/{session_id}/start")
async def start_session(session_id: str):
    """
    Start session timer
    Updates status to 'active' and records start time
    """
    try:
        session = await SessionService.start_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session["id"],
            "status": session["status"],
            "start_time": session["start_time"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/sessions/{session_id}/complete")
async def complete_session(session_id: str, request: SessionCompleteRequest):
    """
    Complete session and process payments
    Calculates final cost, charges teacher, refunds student remainder
    """
    try:
        session = await SessionService.complete_session(
            session_id=session_id,
            duration_seconds=request.duration_seconds
        )
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session["id"],
            "status": session["status"],
            "duration_seconds": session["duration_seconds"],
            "final_cost": session["final_cost"],
            "amount_paid": session["amount_paid"],
            "amount_refunded": session["amount_refunded"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/sessions/{session_id}/status", response_model=SessionStatusResponse)
async def get_session_status(session_id: str):
    """
    Get current session status and payment details
    """
    try:
        session = await SessionService.get_session_status(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionStatusResponse(
            session_id=session["id"],
            course_id=session["course_id"],
            student_id=session["student_id"],
            teacher_id=session["teacher_id"],
            status=session["status"],
            locked_amount=session["locked_amount"],
            final_cost=session.get("final_cost", 0),
            amount_paid=session.get("amount_paid", 0),
            amount_refunded=session.get("amount_refunded", 0),
            start_time=session.get("start_time"),
            end_time=session.get("end_time"),
            duration_seconds=session.get("duration_seconds", 0),
            payment_tx_id=session.get("payment_tx_id")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# PAYMENT ENDPOINTS
# ============================================================================

@app.get("/api/payments/history/{user_id}")
async def get_payment_history(user_id: str):
    """
    Get payment history for a user
    Returns all payments (sent and received)
    """
    try:
        payments = await PaymentService.get_payment_history(user_id)
        return {"payments": payments}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
