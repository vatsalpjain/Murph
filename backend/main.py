from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from models import (
    # Auth models
    SignupRequest, LoginRequest, GoogleLoginRequest, AuthResponse,
    UserResponse, LogoutResponse, RoleUpdateRequest,
    # Session models
    SessionCreateRequest, SessionCreateResponse, SessionStartRequest,
    SessionCompleteRequest, PaymentResponse, SessionStatusResponse,
    WalletBalanceResponse, WalletDepositRequest, WalletDepositResponse,
    VideoSessionStartRequest, VideoSessionStartResponse,
    VideoSessionEndRequest, VideoSessionEndResponse,
    # Analytics models
    UserAnalyticsResponse, WatchCalendarResponse, DomainAnalyticsResponse,
    SessionHistoryResponse
)
from payment_service import SessionService, PaymentService
from wallet_service import WalletService, VideoSessionService
from auth_service import AuthService
from analytics_service import AnalyticsService

app = FastAPI(title="Murph Learning Platform API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# AUTHENTICATION MIDDLEWARE
# ============================================================================

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract and verify JWT token from Authorization header
    Returns user_id if valid, raises HTTPException if invalid
    Used as dependency for protected routes
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Verify token
    user_id = await AuthService.verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_id


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Register new user with email/password
    Creates user profile and optional teacher profile based on role
    Returns user data and session tokens
    """
    try:
        result = await AuthService.signup_with_email(
            email=request.email,
            password=request.password,
            name=request.name,
            role=request.role
        )
        return result
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")  # Debug logging
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login user with email/password
    Returns user profile and session tokens for frontend routing
    """
    try:
        result = await AuthService.login_with_email(
            email=request.email,
            password=request.password
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/auth/google", response_model=AuthResponse)
async def google_login(request: GoogleLoginRequest):
    """
    Login/signup with Google OAuth
    Creates user profile if first-time login (defaults to student role)
    Returns is_new_user flag for onboarding flow
    """
    try:
        result = await AuthService.login_with_google(request.google_token)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Get current authenticated user profile
    Requires valid JWT token in Authorization header
    Used for maintaining user session and role-based routing
    """
    try:
        # Get access token from header to fetch user
        # Note: In production, cache this to avoid repeated DB calls
        user = await AuthService.get_current_user(user_id)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/auth/logout", response_model=LogoutResponse)
async def logout(user_id: str = Depends(get_current_user_id)):
    """
    Logout current user
    Invalidates session tokens
    """
    try:
        result = await AuthService.logout(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/update-role")
async def update_role(
    request: RoleUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update user role (student <-> teacher)
    Creates teacher profile if upgrading to teacher
    Useful for onboarding or role switching
    """
    try:
        result = await AuthService.update_user_role(user_id, request.new_role)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================


# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Public root endpoint"""
    return {"message": "Welcome to Murph Learning Platform API"}

@app.get("/health")
async def health_check():
    """Public health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


# ============================================================================
# SESSION ENDPOINTS (PROTECTED - Require Authentication)
# ============================================================================

@app.post("/api/sessions/create", response_model=SessionCreateResponse)
async def create_session(
    request: SessionCreateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create new session with locked payment
    Locks initial payment amount and creates session record
    PROTECTED: Requires valid JWT token
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


# ============================================================================
# WALLET ENDPOINTS (PROTECTED - For Video Player)
# ============================================================================

@app.get("/wallet/{user_id}", response_model=WalletBalanceResponse)
async def get_wallet_balance(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get user's current wallet balance
    Calculates from deposit/charge/refund history
    PROTECTED: Users can only access their own wallet
    """
    # Verify user can only access their own wallet
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other user's wallet")
    
    try:
        balance = await WalletService.get_balance(user_id)
        return WalletBalanceResponse(user_id=user_id, balance=balance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/wallet/deposit", response_model=WalletDepositResponse)
async def deposit_to_wallet(
    request: WalletDepositRequest,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Deposit funds to user's wallet
    Creates a payment record of type 'deposit'
    PROTECTED: Users can only deposit to their own wallet
    """
    # Verify user can only deposit to their own wallet
    if request.user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot deposit to other user's wallet")
    
    try:
        result = await WalletService.deposit(request.user_id, request.amount)
        
        return WalletDepositResponse(
            payment_id=result["payment_id"],
            amount=result["amount"],
            new_balance=result["new_balance"],
            gateway_tx_id=result["gateway_tx_id"],
            timestamp=result["timestamp"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# VIDEO SESSION ENDPOINTS (PROTECTED - For Video Player)
# ============================================================================

@app.post("/session/start", response_model=VideoSessionStartResponse)
async def start_video_session(
    request: VideoSessionStartRequest,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Start a new video streaming session
    Locks ₹30 from user's wallet
    PROTECTED: Users can only start their own sessions
    """
    # Verify user can only start their own session
    if request.user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot start session for other users")
    
    try:
        result = await VideoSessionService.start_session(
            user_id=request.user_id,
            video_id=request.video_id or "default"
        )
        
        return VideoSessionStartResponse(
            session_id=result["session_id"],
            locked_amount=result["locked_amount"],
            start_time=result["start_time"],
            rate_per_second=result["rate_per_second"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/session/end", response_model=VideoSessionEndResponse)
async def end_video_session(
    request: VideoSessionEndRequest,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    End active video session
    Calculates charge based on duration, refunds remainder
    PROTECTED: Users can only end their own sessions
    """
    # Verify user can only end their own session
    if request.user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot end session for other users")
    
    try:
        result = await VideoSessionService.end_session(request.user_id)
        
        return VideoSessionEndResponse(
            session_id=result["session_id"],
            duration_seconds=result["duration_seconds"],
            amount_charged=result["amount_charged"],
            refund=result["refund"],
            final_balance=result["final_balance"],
            ended_at=result["ended_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/session/active/{user_id}")
async def get_active_video_session(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get user's active video session info
    Returns current duration and cost
    PROTECTED: Users can only view their own sessions
    """
    # Verify user can only view their own session
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot view other user's session")
    
    try:
        session = await VideoSessionService.get_active_session(user_id)
        
        if not session:
            return {"active": False, "message": "No active session"}
        
        return {
            "active": True,
            **session
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# ANALYTICS ENDPOINTS (PROTECTED - For Dashboard)
# ============================================================================

@app.get("/api/stats/user-analytics/{user_id}", response_model=UserAnalyticsResponse)
async def get_user_analytics(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get comprehensive user analytics
    Returns total watch time, videos watched, streaks, and active domains
    PROTECTED: Users can only access their own analytics
    """
    # Verify user can only access their own analytics
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other user's analytics")
    
    try:
        analytics = await AnalyticsService.get_user_analytics(user_id)
        return UserAnalyticsResponse(**analytics)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/stats/watch-calendar/{user_id}", response_model=WatchCalendarResponse)
async def get_watch_calendar(
    user_id: str,
    days: int = 28,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get watch calendar for last N days with streak info
    PROTECTED: Users can only access their own calendar
    """
    # Verify user can only access their own calendar
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other user's calendar")
    
    try:
        calendar_data = await AnalyticsService.get_watch_calendar(user_id, days)
        return WatchCalendarResponse(**calendar_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/stats/domain-analytics/{user_id}", response_model=DomainAnalyticsResponse)
async def get_domain_analytics(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get domain/category-wise analytics with weekly breakdown
    PROTECTED: Users can only access their own domain stats
    """
    # Verify user can only access their own domain analytics
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other user's domain analytics")
    
    try:
        domain_data = await AnalyticsService.get_domain_analytics(user_id)
        return DomainAnalyticsResponse(**domain_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/sessions/user/{user_id}", response_model=SessionHistoryResponse)
async def get_user_session_history(
    user_id: str,
    limit: int = 10,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get user's session history with course details
    Returns recent sessions with progress and payment info
    PROTECTED: Users can only access their own session history
    """
    # Verify user can only access their own session history
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other user's session history")
    
    try:
        sessions = await AnalyticsService.get_user_sessions(user_id, limit)
        return SessionHistoryResponse(sessions=sessions)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
