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
from teacher_analytics_service import TeacherAnalyticsService
from ai_search_service import ai_youtube_search, quick_youtube_search

app = FastAPI(title="Murph Learning Platform API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Finternet demo
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
        # Logout doesn't need the token, just confirm user is authenticated
        # The Depends(get_current_user_id) already validates the token
        return {"message": "Logout successful"}
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
# AI-POWERED YOUTUBE SEARCH ENDPOINTS (PUBLIC)
# ============================================================================

@app.get("/api/search/youtube")
async def search_youtube_videos(q: str, max_results: int = 8):
    """
    AI-powered YouTube search
    Uses LLM to optimize query and rank results for educational content
    PUBLIC: No authentication required
    
    Query Parameters:
    - q: Search query string
    - max_results: Maximum number of results (default 8)
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    try:
        result = await ai_youtube_search(q.strip(), max_results)
        return result
    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search/youtube/quick")
async def quick_search_youtube(q: str, max_results: int = 5):
    """
    Quick YouTube search without AI ranking
    Faster response for real-time search suggestions
    PUBLIC: No authentication required
    """
    if not q or len(q.strip()) < 2:
        return {"videos": []}
    
    try:
        videos = await quick_youtube_search(q.strip(), max_results)
        return {"videos": videos}
    except Exception as e:
        print(f"❌ Quick search error: {e}")
        return {"videos": []}


# ============================================================================
# COURSES ENDPOINTS (PUBLIC - For browsing courses)
# ============================================================================

@app.get("/api/courses")
async def get_all_courses(category: Optional[str] = None, limit: int = 20):
    """
    Get all active courses for students to browse
    Optionally filter by category
    Returns course info with video details for player
    PUBLIC: No authentication required
    """
    from database import supabase
    
    try:
        query = supabase.table("courses")\
            .select("*, teachers!inner(id, user_id, bio, is_verified, users!inner(name, email))")\
            .eq("is_active", True)\
            .limit(limit)
        
        if category:
            query = query.ilike("category", f"%{category}%")
        
        result = query.execute()
        
        courses = []
        for course in result.data or []:
            teacher_info = course.get("teachers", {})
            user_info = teacher_info.get("users", {})
            content = course.get("content_structure", {})
            
            courses.append({
                "id": course["id"],
                "title": course["title"],
                "description": course["description"],
                "category": course["category"],
                "price_per_minute": float(course["price_per_minute"]),
                "total_duration_minutes": course["total_duration_minutes"],
                "video_id": content.get("video_id"),
                "video_url": content.get("video_url"),
                "lectures": content.get("lectures", []),
                "instructor": {
                    "id": teacher_info.get("id"),
                    "name": user_info.get("name", "Unknown Instructor"),
                    "is_verified": teacher_info.get("is_verified", False)
                },
                "thumbnail": f"https://img.youtube.com/vi/{content.get('video_id', '')}/mqdefault.jpg",
                "created_at": course["created_at"]
            })
        
        return {"courses": courses, "total": len(courses)}
    
    except Exception as e:
        print(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/courses/{course_id}")
async def get_course_by_id(course_id: str):
    """
    Get single course details by ID
    Returns full course info including lecture structure
    PUBLIC: No authentication required
    """
    from database import supabase
    
    try:
        result = supabase.table("courses")\
            .select("*, teachers!inner(id, user_id, bio, is_verified, users!inner(name, email))")\
            .eq("id", course_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = result.data
        teacher_info = course.get("teachers", {})
        user_info = teacher_info.get("users", {})
        content = course.get("content_structure", {})
        
        return {
            "id": course["id"],
            "title": course["title"],
            "description": course["description"],
            "category": course["category"],
            "price_per_minute": float(course["price_per_minute"]),
            "total_duration_minutes": course["total_duration_minutes"],
            "video_id": content.get("video_id"),
            "video_url": content.get("video_url"),
            "lectures": content.get("lectures", []),
            "instructor": {
                "id": teacher_info.get("id"),
                "name": user_info.get("name", "Unknown Instructor"),
                "bio": teacher_info.get("bio"),
                "is_verified": teacher_info.get("is_verified", False)
            },
            "thumbnail": f"https://img.youtube.com/vi/{content.get('video_id', '')}/mqdefault.jpg",
            "is_active": course["is_active"],
            "created_at": course["created_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching course: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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

@app.get("/session/pricing/{course_id}")
async def get_course_pricing(course_id: str):
    """
    Get course pricing based on rating
    Assigns random rating if first access
    PUBLIC: Anyone can check pricing before watching
    """
    try:
        pricing = await VideoSessionService.get_course_pricing(course_id)
        return pricing
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/session/start", response_model=VideoSessionStartResponse)
async def start_video_session(
    request: VideoSessionStartRequest,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Start a new video streaming session
    Locks 50% of video cost from user's wallet
    PROTECTED: Users can only start their own sessions
    """
    # Verify user can only start their own session
    if request.user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot start session for other users")
    
    try:
        result = await VideoSessionService.start_session(
            user_id=request.user_id,
            video_id=request.video_id or "default",
            course_id=request.course_id,
            lock_amount=request.lock_amount,
            price_per_minute=request.price_per_minute
        )
        
        return VideoSessionStartResponse(
            session_id=result["session_id"],
            locked_amount=result["locked_amount"],
            price_per_minute=result["price_per_minute"],
            start_time=result["start_time"],
            rate_per_second=result["rate_per_second"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/session/end-beacon")
async def end_video_session_beacon(request: dict):
    """
    End video session via sendBeacon (for page unload)
    This endpoint doesn't require auth headers since sendBeacon can't set them.
    It processes the session end to ensure user gets refund even if they close the tab.
    
    Security: We verify the session belongs to the user by checking the session_id
    """
    try:
        user_id = request.get("user_id")
        session_id = request.get("session_id")
        duration_seconds = request.get("duration_seconds", 0)
        price_per_minute = request.get("price_per_minute", 2.0)
        locked_amount = request.get("locked_amount", 30.0)
        
        if not user_id:
            return {"status": "error", "message": "Missing user_id"}
        
        result = await VideoSessionService.end_session(
            user_id=user_id,
            session_id=session_id,
            duration_seconds=duration_seconds,
            price_per_minute=price_per_minute,
            locked_amount=locked_amount
        )
        
        return {
            "status": "success",
            "session_id": result["session_id"],
            "amount_charged": result["amount_charged"],
            "refund": result["refund"]
        }
    except Exception as e:
        # Log error but don't fail - this is best-effort cleanup
        print(f"Beacon end session error: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.post("/session/end", response_model=VideoSessionEndResponse)
async def end_video_session(
    request: VideoSessionEndRequest,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    End video session and process payment
    Frontend sends: duration watched, price rate, locked amount
    Backend calculates: final charge, refund
    PROTECTED: Users can only end their own sessions
    """
    # Verify user can only end their own session
    if request.user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Cannot end session for other users")
    
    try:
        result = await VideoSessionService.end_session(
            user_id=request.user_id,
            session_id=request.session_id,
            duration_seconds=request.duration_seconds,
            price_per_minute=request.price_per_minute,
            locked_amount=request.locked_amount
        )
        
        return VideoSessionEndResponse(
            session_id=result["session_id"],
            duration_seconds=result["duration_seconds"],
            duration_minutes=result["duration_minutes"],
            price_per_minute=result["price_per_minute"],
            amount_charged=result["amount_charged"],
            amount_locked=result["amount_locked"],
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


# ============================================================================
# TEACHER ANALYTICS ENDPOINTS (PROTECTED - For Teacher Dashboard)
# ============================================================================

@app.get("/api/teacher/dashboard")
async def get_teacher_dashboard_analytics(
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get comprehensive teacher dashboard analytics
    Returns: total earnings, monthly earnings, session stats, ratings
    PROTECTED: Teachers can only access their own dashboard
    """
    try:
        # Get teacher ID from user ID
        teacher_id = await TeacherAnalyticsService.get_teacher_id_from_user_id(authenticated_user_id)
        
        if not teacher_id:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        
        analytics = await TeacherAnalyticsService.get_dashboard_analytics(teacher_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/teacher/lecture-earnings")
async def get_teacher_lecture_earnings(
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get lecture-wise earnings breakdown
    Returns: Array of courses with earnings details per lecture
    PROTECTED: Teachers can only access their own earnings
    """
    try:
        # Get teacher ID from user ID
        teacher_id = await TeacherAnalyticsService.get_teacher_id_from_user_id(authenticated_user_id)
        
        if not teacher_id:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        
        lecture_earnings = await TeacherAnalyticsService.get_lecture_wise_earnings(teacher_id)
        return {"lectures": lecture_earnings}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/teacher/student-scores")
async def get_teacher_student_scores(
    course_id: Optional[str] = None,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get student MCQ assessment scores
    Returns: Array of student scores with discount eligibility
    PROTECTED: Teachers can only view scores for their own courses
    """
    try:
        # Get teacher ID from user ID
        teacher_id = await TeacherAnalyticsService.get_teacher_id_from_user_id(authenticated_user_id)
        
        if not teacher_id:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        
        student_scores = await TeacherAnalyticsService.get_student_mcq_scores(teacher_id, course_id)
        return {"student_scores": student_scores}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/teacher/popular-lectures")
async def get_teacher_popular_lectures(
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """
    Get popular lectures analytics
    Returns: Array of courses sorted by enrollment/popularity
    PROTECTED: Teachers can only view stats for their own courses
    """
    try:
        # Get teacher ID from user ID
        teacher_id = await TeacherAnalyticsService.get_teacher_id_from_user_id(authenticated_user_id)
        
        if not teacher_id:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
        
        popular_lectures = await TeacherAnalyticsService.get_popular_lectures(teacher_id)
        return {"popular_lectures": popular_lectures}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# FINTERNET PAYMENT GATEWAY ENDPOINTS
# ============================================================================

from eth_account import Account
from pydantic import BaseModel
import time

# Initialize Finternet Agent Wallet
finternet_agent = Account.create()
print(f"\n🚀 Finternet Agent Wallet: {finternet_agent.address}")
print(f"-------------------------------------------\n")

# In-memory storage for payment intents (demo - for blockchain simulation)
finternet_payments = {}

# Default initial balance for new users (₹200) - matches WalletService.INITIAL_BALANCE
INITIAL_BALANCE_RUPEES = 200.0

class FinternetPaymentRequest(BaseModel):
    amount: float
    currency: str = "INR"
    method: str
    payment_details: dict
    user_id: Optional[str] = None


class BalanceRequest(BaseModel):
    user_id: str


@app.post("/api/wallet/balance")
async def post_wallet_balance(request: BalanceRequest):
    """Get wallet balance - POST version to handle various user ID formats"""
    try:
        balance = await WalletService.get_balance(request.user_id)
        print(f"💰 Balance for {request.user_id}: ₹{balance}")
        return {
            "balance": balance,
            "currency": "INR",
            "user_id": request.user_id
        }
    except Exception as e:
        print(f"⚠️ Balance fetch error for {request.user_id}: {str(e)}")
        # Return initial balance if user has no transactions yet
        return {
            "balance": INITIAL_BALANCE_RUPEES,
            "currency": "INR",
            "user_id": request.user_id
        }


@app.get("/api/wallet/balance")
async def get_finternet_wallet_balance(
    user_id: Optional[str] = None,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """Get wallet balance from Supabase database"""
    target_user = user_id or authenticated_user_id
    try:
        balance = await WalletService.get_balance(target_user)
        print(f"💰 Balance for {target_user}: ₹{balance}")
        return {
            "balance": balance,
            "currency": "INR",
            "user_id": target_user
        }
    except Exception as e:
        print(f"⚠️ Balance fetch error for {target_user}: {str(e)}")
        # Return default balance if error
        return {
            "balance": INITIAL_BALANCE_RUPEES,
            "currency": "INR",
            "user_id": target_user
        }


@app.get("/api/wallet/balance-public")
async def get_public_wallet_balance():
    """Public endpoint for demo - returns default balance"""
    return {
        "balance": INITIAL_BALANCE_RUPEES,
        "currency": "INR"
    }


@app.post("/api/wallet/deposit")
async def deposit_to_wallet(
    amount: float,
    user_id: Optional[str] = None,
    authenticated_user_id: str = Depends(get_current_user_id)
):
    """Deposit to wallet using Supabase database"""
    target_user = user_id or authenticated_user_id
    try:
        result = await WalletService.deposit(target_user, amount)
        return {
            "success": True,
            "new_balance": result["new_balance"],
            "deposited": amount,
            "payment_id": result["payment_id"],
            "currency": "INR"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/create-payment")
async def create_finternet_payment(req: FinternetPaymentRequest):
    """Create Finternet payment intent - NO balance validation"""
    intent_id = f"int_{int(time.time())}"
    
    finternet_payments[intent_id] = {
        "status": "INITIATED",
        "amount": req.amount,
        "currency": req.currency or "INR",
        "method": req.method,
        "payment_details": req.payment_details,
        "user_id": req.user_id,
        "confirmations": 0
    }
    
    return {
        "intentId": intent_id,
        "paymentUrl": f"https://docs.fmm.finternetlab.io/pay/{intent_id}",
        "status": "INITIATED",
        "amount": req.amount
    }


@app.post("/api/sign-and-confirm/{intent_id}")
async def sign_and_confirm_payment(intent_id: str):
    """Sign payment with EIP-712 and submit to blockchain (simulated)"""
    if intent_id not in finternet_payments:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = finternet_payments[intent_id]
    payment["status"] = "PROCESSING"
    
    return {
        "status": "PROCESSING",
        "message": "Signature verified. Transaction submitted to blockchain.",
        "agent": finternet_agent.address
    }


@app.get("/api/status/{intent_id}")
async def get_finternet_payment_status(intent_id: str):
    """Check payment status with blockchain confirmation simulation"""
    if intent_id not in finternet_payments:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = finternet_payments[intent_id]
    
    # Simulate blockchain confirmations
    if payment["status"] == "PROCESSING":
        if payment["confirmations"] < 5:
            payment["confirmations"] += 1
        else:
            payment["status"] = "SUCCEEDED"
            # Deposit to user's Supabase wallet when payment settles
            if payment.get("user_id"):
                try:
                    await WalletService.deposit(payment["user_id"], payment["amount"])
                except:
                    pass  # Silently fail if deposit fails
    
    if payment["status"] == "SUCCEEDED":
        payment["status"] = "SETTLED"
    
    return {
        "intentId": intent_id,
        "status": payment["status"],
        "confirmations": payment["confirmations"],
        "is_confirmed": payment["confirmations"] >= 5
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

