"""
Wallet Service - Manages user wallet balance and video session payments
Integrates with existing session and payment infrastructure
"""
import uuid
import random
from datetime import datetime
from typing import Dict, Any, Optional
from database import supabase
from payment_service import PaymentService


def calculate_price_from_rating(rating: float) -> float:
    """
    Calculate price per minute based on video rating
    Rating 1.0-5.0 → Price ₹1.00-₹3.00 per minute
    Formula: base ₹1 + (rating - 1) * 0.5
    """
    if rating is None:
        return 2.0  # Default ₹2/min if no rating
    rating = max(1.0, min(5.0, rating))  # Clamp between 1-5
    return round(1.0 + (rating - 1) * 0.5, 2)


def generate_random_rating() -> float:
    """Generate a random rating between 1.0 and 5.0 (one decimal place)"""
    return round(random.uniform(1.0, 5.0), 1)


# In-memory balance tracking for test users (non-UUID users like "test-admin-001")
# This persists during server runtime but resets on restart
TEST_USER_BALANCES: Dict[str, float] = {}


class WalletService:
    """Manages user wallet operations for video streaming payments"""
    
    @staticmethod
    def is_valid_uuid(value: str) -> bool:
        """Check if string is a valid UUID"""
        try:
            uuid.UUID(str(value))
            return True
        except (ValueError, AttributeError):
            return False
    
    # Initial balance for new users
    INITIAL_BALANCE = 200.0
    
    @staticmethod
    async def get_balance(user_id: str, auto_create_initial: bool = True) -> float:
        """
        Calculate user's current wallet balance
        Balance = Total deposits - Total charges + Total refunds
        NOTE: Locks are NOT counted as charges - they are temporary holds
              that get converted to charges when session ends
        
        If user has no transactions and auto_create_initial=True, creates initial deposit.
        """
        # If user_id is not a valid UUID, use in-memory tracking for test users
        # This handles test accounts like "test-admin-001"
        if not WalletService.is_valid_uuid(user_id):
            if user_id not in TEST_USER_BALANCES:
                TEST_USER_BALANCES[user_id] = WalletService.INITIAL_BALANCE
                print(f"🧪 Initialized test user {user_id} with ₹{WalletService.INITIAL_BALANCE}")
            balance = TEST_USER_BALANCES[user_id]
            print(f"🧪 Test user {user_id} balance: ₹{balance}")
            return balance
        
        try:
            # Get all deposit transactions
            deposits = supabase.table("payments")\
                .select("amount")\
                .eq("to_user_id", user_id)\
                .eq("payment_type", "deposit")\
                .execute()
            
            total_deposits = sum(p["amount"] for p in deposits.data) if deposits.data else 0
            
            # Get only actual charges (NOT locks - locks are temporary)
            # Locks get "released" via refund when session ends
            charges = supabase.table("payments")\
                .select("amount")\
                .eq("from_user_id", user_id)\
                .eq("payment_type", "charge")\
                .execute()
            
            total_charges = sum(p["amount"] for p in charges.data) if charges.data else 0
            
            # Get all refunds received
            refunds = supabase.table("payments")\
                .select("amount")\
                .eq("to_user_id", user_id)\
                .eq("payment_type", "refund")\
                .execute()
            
            total_refunds = sum(p["amount"] for p in refunds.data) if refunds.data else 0
            
            # If user has NO transactions at all, create initial deposit
            if total_deposits == 0 and total_charges == 0 and total_refunds == 0 and auto_create_initial:
                print(f"📥 Creating initial deposit of ₹{WalletService.INITIAL_BALANCE} for new user: {user_id}")
                await WalletService.create_initial_deposit(user_id)
                return WalletService.INITIAL_BALANCE
            
            # Calculate final balance
            # Balance = deposits - charges + refunds (locks are ignored)
            balance = total_deposits - total_charges + total_refunds
            
            return round(balance, 2)
            
        except Exception as e:
            raise ValueError(f"Failed to calculate balance: {str(e)}")
    
    @staticmethod
    async def create_initial_deposit(user_id: str) -> None:
        """
        Create initial deposit for a new user (welcome bonus)
        This is called automatically when user first checks balance
        """
        if not WalletService.is_valid_uuid(user_id):
            return  # Skip for test accounts
        
        try:
            from payment_service import PaymentService
            gateway_tx_id = PaymentService.generate_tx_id("welcome")
            
            payment_data = {
                "payment_type": "deposit",
                "amount": WalletService.INITIAL_BALANCE,
                "to_user_id": user_id,
                "gateway_tx_id": gateway_tx_id,
                "gateway_status": "completed",
                "completed_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("payments").insert(payment_data).execute()
            print(f"✅ Initial deposit created for user {user_id}: ₹{WalletService.INITIAL_BALANCE}")
        except Exception as e:
            print(f"⚠️ Failed to create initial deposit: {str(e)}")
    
    @staticmethod
    async def deposit(user_id: str, amount: float) -> Dict[str, Any]:
        """
        Add funds to user's wallet
        Creates a deposit payment record
        """
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        
        # Verify user exists
        user = supabase.table("users").select("id").eq("id", user_id).execute()
        if not user.data:
            raise ValueError(f"User {user_id} not found")
        
        # Create deposit payment record
        gateway_tx_id = PaymentService.generate_tx_id("deposit")
        
        payment_data = {
            "payment_type": "deposit",
            "amount": amount,
            "to_user_id": user_id,
            "gateway_tx_id": gateway_tx_id,
            "gateway_status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("payments").insert(payment_data).execute()
        
        # Get updated balance
        new_balance = await WalletService.get_balance(user_id)
        
        return {
            "payment_id": result.data[0]["id"],
            "amount": amount,
            "gateway_tx_id": gateway_tx_id,
            "new_balance": new_balance,
            "timestamp": datetime.utcnow().isoformat()
        }


class VideoSessionService:
    """
    Manages video streaming sessions with wallet-based payments
    
    NEW FLOW (Frontend tracks locally, backend processes on end):
    1. Frontend calls /session/start with video info
    2. Backend calculates lock amount (50% of video cost) and creates lock payment
    3. Frontend tracks watch time locally
    4. On exit, frontend calls /session/end with duration watched
    5. Backend calculates charge, creates charge + refund records
    6. Returns summary for popup display
    """
    
    @staticmethod
    async def get_course_pricing(course_id: str) -> Dict[str, Any]:
        """
        Get course pricing info including rating-based price
        Assigns random rating if not yet rated
        """
        try:
            course = supabase.table("courses")\
                .select("id, title, rating, total_duration_minutes")\
                .eq("id", course_id)\
                .single()\
                .execute()
            
            if not course.data:
                raise ValueError(f"Course {course_id} not found")
            
            course_data = course.data
            
            # Assign random rating if not yet rated (first access)
            if course_data.get("rating") is None:
                new_rating = generate_random_rating()
                supabase.table("courses")\
                    .update({"rating": new_rating})\
                    .eq("id", course_id)\
                    .execute()
                course_data["rating"] = new_rating
            
            rating = float(course_data["rating"])
            price_per_minute = calculate_price_from_rating(rating)
            total_duration = course_data.get("total_duration_minutes", 30) or 30
            total_video_cost = round(total_duration * price_per_minute, 2)
            lock_amount = round(total_video_cost * 0.5, 2)  # 50% lock
            
            return {
                "course_id": course_id,
                "title": course_data.get("title", "Unknown"),
                "rating": rating,
                "price_per_minute": price_per_minute,
                "total_duration_minutes": total_duration,
                "total_video_cost": total_video_cost,
                "lock_amount": lock_amount
            }
        except Exception as e:
            raise ValueError(f"Failed to get course pricing: {str(e)}")
    
    @staticmethod
    async def start_session(
        user_id: str, 
        video_id: str = "default",
        course_id: Optional[str] = None,
        lock_amount: Optional[float] = None,
        price_per_minute: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Start a new video session with wallet lock
        Lock amount = 50% of video cost (or provided amount)
        """
        # Get pricing from course if available
        if course_id:
            try:
                pricing = await VideoSessionService.get_course_pricing(course_id)
                lock_amount = lock_amount or pricing["lock_amount"]
                price_per_minute = price_per_minute or pricing["price_per_minute"]
            except:
                pass  # Use defaults if course not found
        
        # Default values
        lock_amount = lock_amount or 30.0  # Default ₹30 lock
        price_per_minute = price_per_minute or 2.0  # Default ₹2/min
        
        # Verify user has sufficient balance
        balance = await WalletService.get_balance(user_id)
        if balance < lock_amount:
            raise ValueError(f"Insufficient balance. Required: ₹{lock_amount}, Available: ₹{balance}")
        
        # Create session ID
        session_id = f"vs_{uuid.uuid4().hex[:16]}"
        
        # Lock payment (only insert to DB if valid UUID user)
        gateway_tx_id = PaymentService.generate_tx_id("lock")
        
        if WalletService.is_valid_uuid(user_id):
            lock_payment = {
                "session_id": session_id,
                "payment_type": "lock",
                "amount": lock_amount,
                "from_user_id": user_id,
                "gateway_tx_id": gateway_tx_id,
                "gateway_status": "completed",
                "completed_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("payments").insert(lock_payment).execute()
        else:
            print(f"Skipping lock payment insert for non-UUID user: {user_id}")
        
        # Store session in database for persistence (only for valid UUID users)
        if WalletService.is_valid_uuid(user_id):
            session_record = {
                "id": session_id,
                "student_id": user_id,
                "course_id": course_id,
                "status": "active",
                "locked_amount": lock_amount,
                "lock_tx_id": gateway_tx_id,
                "start_time": datetime.utcnow().isoformat()
            }
            
            # Try to insert into sessions table (if schema allows)
            try:
                supabase.table("sessions").insert(session_record).execute()
            except:
                pass  # Session table might have different schema
        else:
            # For test users with non-UUID IDs, skip session table insert
            print(f"Skipping session table insert for non-UUID user: {user_id}")
        
        return {
            "session_id": session_id,
            "locked_amount": lock_amount,
            "price_per_minute": price_per_minute,
            "start_time": datetime.utcnow().isoformat(),
            "rate_per_second": round(price_per_minute / 60, 4)
        }
    
    @staticmethod
    async def end_session(
        user_id: str,
        session_id: Optional[str] = None,
        duration_seconds: int = 0,
        price_per_minute: float = 2.0,
        locked_amount: float = 30.0
    ) -> Dict[str, Any]:
        """
        End video session and process payment
        Frontend sends: duration watched, price rate, locked amount
        Backend calculates: final charge, refund
        """
        end_time = datetime.utcnow()
        
        # Calculate charge amount based on actual watch time
        duration_minutes = duration_seconds / 60
        calculated_charge = round(duration_minutes * price_per_minute, 2)
        
        # Ensure charge doesn't exceed locked amount
        final_charge = min(calculated_charge, locked_amount)
        refund_amount = round(locked_amount - final_charge, 2)
        
        # Ensure no negative values
        final_charge = max(0, final_charge)
        refund_amount = max(0, refund_amount)
        
        # Generate session_id if not provided
        if not session_id:
            session_id = f"vs_{uuid.uuid4().hex[:16]}"
        
        # Check if user has valid UUID
        is_valid_user = WalletService.is_valid_uuid(user_id)
        
        # For TEST USERS: Deduct from in-memory balance
        if not is_valid_user:
            if user_id not in TEST_USER_BALANCES:
                TEST_USER_BALANCES[user_id] = WalletService.INITIAL_BALANCE
            
            old_balance = TEST_USER_BALANCES[user_id]
            TEST_USER_BALANCES[user_id] = round(old_balance - final_charge, 2)
            print(f"🧪 TEST USER CHARGE: {user_id} charged ₹{final_charge} | Balance: ₹{old_balance} → ₹{TEST_USER_BALANCES[user_id]}")
        
        # Record charge payment (only for valid UUID users in DB)
        if final_charge > 0 and is_valid_user:
            charge_tx_id = PaymentService.generate_tx_id("charge")
            
            charge_payment = {
                "session_id": session_id,
                "payment_type": "charge",
                "amount": final_charge,
                "from_user_id": user_id,
                "gateway_tx_id": charge_tx_id,
                "gateway_status": "completed",
                "completed_at": end_time.isoformat()
            }
            
            supabase.table("payments").insert(charge_payment).execute()
            print(f"💳 DB CHARGE: {user_id} charged ₹{final_charge}")
        
        # Record refund (release remaining locked amount)
        if refund_amount > 0 and is_valid_user:
            refund_tx_id = PaymentService.generate_tx_id("refund")
            
            refund_payment = {
                "session_id": session_id,
                "payment_type": "refund",
                "amount": refund_amount,
                "to_user_id": user_id,
                "gateway_tx_id": refund_tx_id,
                "gateway_status": "completed",
                "completed_at": end_time.isoformat()
            }
            
            supabase.table("payments").insert(refund_payment).execute()
        
        # Update session record in database (only for valid UUID users)
        if is_valid_user:
            try:
                supabase.table("sessions")\
                    .update({
                        "status": "completed",
                        "end_time": end_time.isoformat(),
                        "duration_seconds": duration_seconds,
                        "final_cost": final_charge,
                        "amount_refunded": refund_amount
                    })\
                    .eq("id", session_id)\
                    .execute()
            except:
                pass  # Session might not exist in DB
        
        # Calculate final balance
        final_balance = await WalletService.get_balance(user_id)
        
        return {
            "session_id": session_id,
            "duration_seconds": duration_seconds,
            "duration_minutes": round(duration_minutes, 2),
            "price_per_minute": price_per_minute,
            "amount_charged": final_charge,
            "amount_locked": locked_amount,
            "refund": refund_amount,
            "final_balance": final_balance,
            "ended_at": end_time.isoformat()
        }
    
    @staticmethod
    async def get_active_session(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's active session from database if exists"""
        try:
            result = supabase.table("sessions")\
                .select("*")\
                .eq("student_id", user_id)\
                .eq("status", "active")\
                .order("start_time", desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                session = result.data[0]
                return {
                    "session_id": session["id"],
                    "locked_amount": float(session.get("locked_amount", 30)),
                    "start_time": session.get("start_time")
                }
        except:
            pass
        
        return None
