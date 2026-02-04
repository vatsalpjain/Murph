"""
Payment service - handles all payment logic and database operations
"""
import uuid
from datetime import datetime
from typing import Dict, Any
from database import supabase


class PaymentService:
    """Manages payment operations for sessions"""
    
    @staticmethod
    def generate_tx_id(prefix: str) -> str:
        """Generate unique transaction ID"""
        return f"{prefix}_{uuid.uuid4().hex[:16]}"
    
    @staticmethod
    async def lock_payment(session_id: str, student_id: str, amount: float) -> Dict[str, Any]:
        """
        Lock initial payment amount
        Creates payment record with type 'lock'
        """
        gateway_tx_id = PaymentService.generate_tx_id("lock")
        
        payment_data = {
            "session_id": session_id,
            "payment_type": "lock",
            "amount": amount,
            "from_user_id": student_id,
            "gateway_tx_id": gateway_tx_id,
            "gateway_status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("payments").insert(payment_data).execute()
        
        return result.data[0] if result.data else None
    
    @staticmethod
    async def charge_payment(session_id: str, student_id: str, teacher_id: str, amount: float) -> Dict[str, Any]:
        """
        Charge final payment amount to teacher
        Creates payment record with type 'charge'
        """
        gateway_tx_id = PaymentService.generate_tx_id("charge")
        
        payment_data = {
            "session_id": session_id,
            "payment_type": "charge",
            "amount": amount,
            "from_user_id": student_id,
            "to_user_id": teacher_id,
            "gateway_tx_id": gateway_tx_id,
            "gateway_status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("payments").insert(payment_data).execute()
        
        return result.data[0] if result.data else None
    
    @staticmethod
    async def refund_payment(session_id: str, student_id: str, amount: float) -> Dict[str, Any]:
        """
        Refund remaining locked amount back to student
        Creates payment record with type 'refund'
        """
        gateway_tx_id = PaymentService.generate_tx_id("refund")
        
        payment_data = {
            "session_id": session_id,
            "payment_type": "refund",
            "amount": amount,
            "to_user_id": student_id,
            "gateway_tx_id": gateway_tx_id,
            "gateway_status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("payments").insert(payment_data).execute()
        
        return result.data[0] if result.data else None
    
    @staticmethod
    async def get_payment_history(user_id: str) -> list[Dict[str, Any]]:
        """Get all payments for a user (sent or received)"""
        
        # Get payments sent by user
        sent = supabase.table("payments")\
            .select("*")\
            .eq("from_user_id", user_id)\
            .execute()
        
        # Get payments received by user
        received = supabase.table("payments")\
            .select("*")\
            .eq("to_user_id", user_id)\
            .execute()
        
        all_payments = (sent.data or []) + (received.data or [])
        
        # Sort by created_at descending
        all_payments.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return all_payments


class SessionService:
    """Manages session lifecycle and payment flow"""
    
    @staticmethod
    async def create_session(course_id: str, student_id: str, locked_amount: float) -> Dict[str, Any]:
        """
        Create new session with locked payment
        Flow: Lock funds → Create session record
        """
        # Get course details to find teacher_id and price
        course = supabase.table("courses").select("*").eq("id", course_id).single().execute()
        
        if not course.data:
            raise ValueError(f"Course {course_id} not found")
        
        teacher_id = course.data["teacher_id"]
        
        # Generate transaction ID for lock
        lock_tx_id = PaymentService.generate_tx_id("lock")
        
        # Create session with locked status
        session_data = {
            "course_id": course_id,
            "student_id": student_id,
            "teacher_id": teacher_id,
            "status": "locked",
            "locked_amount": locked_amount,
            "payment_tx_id": lock_tx_id,
            "lock_tx_id": lock_tx_id
        }
        
        session_result = supabase.table("sessions").insert(session_data).execute()
        
        if not session_result.data:
            raise ValueError("Failed to create session")
        
        session = session_result.data[0]
        
        # Record lock payment
        await PaymentService.lock_payment(session["id"], student_id, locked_amount)
        
        return session
    
    @staticmethod
    async def start_session(session_id: str) -> Dict[str, Any]:
        """
        Start session timer
        Updates status to 'active' and sets start_time
        """
        update_data = {
            "status": "active",
            "start_time": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("sessions")\
            .update(update_data)\
            .eq("id", session_id)\
            .execute()
        
        return result.data[0] if result.data else None
    
    @staticmethod
    async def complete_session(session_id: str, duration_seconds: int) -> Dict[str, Any]:
        """
        Complete session and process payments
        Flow: Calculate cost → Charge teacher → Refund student remainder
        """
        # Get session details
        session = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
        
        if not session.data:
            raise ValueError(f"Session {session_id} not found")
        
        session_data = session.data
        
        # Get course pricing
        course = supabase.table("courses")\
            .select("price_per_minute")\
            .eq("id", session_data["course_id"])\
            .single()\
            .execute()
        
        price_per_minute = float(course.data["price_per_minute"])
        
        # Calculate final cost based on actual duration
        duration_minutes = duration_seconds / 60
        final_cost = round(price_per_minute * duration_minutes, 2)
        
        # Ensure final cost doesn't exceed locked amount
        locked_amount = float(session_data["locked_amount"])
        if final_cost > locked_amount:
            final_cost = locked_amount
        
        # Calculate refund
        refund_amount = round(locked_amount - final_cost, 2)
        
        # Update session
        update_data = {
            "status": "completed",
            "end_time": datetime.utcnow().isoformat(),
            "duration_seconds": duration_seconds,
            "final_cost": final_cost,
            "amount_paid": final_cost,
            "amount_refunded": refund_amount
        }
        
        updated_session = supabase.table("sessions")\
            .update(update_data)\
            .eq("id", session_id)\
            .execute()
        
        # Process payment to teacher
        if final_cost > 0:
            await PaymentService.charge_payment(
                session_id,
                session_data["student_id"],
                session_data["teacher_id"],
                final_cost
            )
        
        # Refund remaining to student
        if refund_amount > 0:
            await PaymentService.refund_payment(
                session_id,
                session_data["student_id"],
                refund_amount
            )
        
        return updated_session.data[0] if updated_session.data else None
    
    @staticmethod
    async def get_session_status(session_id: str) -> Dict[str, Any]:
        """Get current session status and payment details"""
        result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
        return result.data if result.data else None
