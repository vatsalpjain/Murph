"""
Wallet Service - Manages user wallet balance and video session payments
Integrates with existing session and payment infrastructure
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from database import supabase
from payment_service import PaymentService


class WalletService:
    """Manages user wallet operations for video streaming payments"""
    
    @staticmethod
    async def get_balance(user_id: str) -> float:
        """
        Calculate user's current wallet balance
        Balance = Total deposits - Total charges + Total refunds
        """
        try:
            # Get all deposit transactions
            deposits = supabase.table("payments")\
                .select("amount")\
                .eq("to_user_id", user_id)\
                .eq("payment_type", "deposit")\
                .execute()
            
            total_deposits = sum(p["amount"] for p in deposits.data) if deposits.data else 0
            
            # Get all charges (money spent)
            charges = supabase.table("payments")\
                .select("amount")\
                .eq("from_user_id", user_id)\
                .in_("payment_type", ["lock", "charge"])\
                .execute()
            
            total_charges = sum(p["amount"] for p in charges.data) if charges.data else 0
            
            # Get all refunds received
            refunds = supabase.table("payments")\
                .select("amount")\
                .eq("to_user_id", user_id)\
                .eq("payment_type", "refund")\
                .execute()
            
            total_refunds = sum(p["amount"] for p in refunds.data) if refunds.data else 0
            
            # Calculate final balance
            balance = total_deposits - total_charges + total_refunds
            
            return round(balance, 2)
            
        except Exception as e:
            raise ValueError(f"Failed to calculate balance: {str(e)}")
    
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
    """Manages video streaming sessions with wallet-based payments"""
    
    # Session storage (in production, use Redis or database)
    _active_sessions: Dict[str, Dict[str, Any]] = {}
    
    # Configuration
    LOCK_AMOUNT = 30.00  # ₹30 escrow lock
    RATE_PER_SECOND = 0.033  # ₹2/min = ₹0.033/sec
    
    @staticmethod
    async def start_session(user_id: str, video_id: str = "default") -> Dict[str, Any]:
        """
        Start a new video session with wallet lock
        Locks ₹30 from user's wallet balance
        """
        # Check if user already has active session
        if user_id in VideoSessionService._active_sessions:
            raise ValueError("User already has an active session. Please end current session first.")
        
        # Verify user has sufficient balance
        balance = await WalletService.get_balance(user_id)
        if balance < VideoSessionService.LOCK_AMOUNT:
            raise ValueError(f"Insufficient balance. Required: ₹{VideoSessionService.LOCK_AMOUNT}, Available: ₹{balance}")
        
        # Create session ID
        session_id = f"vs_{uuid.uuid4().hex[:16]}"
        
        # Lock payment
        gateway_tx_id = PaymentService.generate_tx_id("lock")
        
        lock_payment = {
            "session_id": session_id,
            "payment_type": "lock",
            "amount": VideoSessionService.LOCK_AMOUNT,
            "from_user_id": user_id,
            "gateway_tx_id": gateway_tx_id,
            "gateway_status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("payments").insert(lock_payment).execute()
        
        # Create session record
        session_data = {
            "user_id": user_id,
            "video_id": video_id,
            "session_id": session_id,
            "locked_amount": VideoSessionService.LOCK_AMOUNT,
            "start_time": datetime.utcnow(),
            "lock_tx_id": gateway_tx_id
        }
        
        VideoSessionService._active_sessions[user_id] = session_data
        
        return {
            "session_id": session_id,
            "locked_amount": VideoSessionService.LOCK_AMOUNT,
            "start_time": session_data["start_time"].isoformat(),
            "rate_per_second": VideoSessionService.RATE_PER_SECOND
        }
    
    @staticmethod
    async def end_session(user_id: str) -> Dict[str, Any]:
        """
        End active video session
        Calculates final charge, refunds remainder to wallet
        """
        # Get active session
        if user_id not in VideoSessionService._active_sessions:
            raise ValueError("No active session found for user")
        
        session = VideoSessionService._active_sessions[user_id]
        
        # Calculate duration and cost
        end_time = datetime.utcnow()
        duration_seconds = (end_time - session["start_time"]).total_seconds()
        
        # Calculate charge amount
        calculated_charge = round(duration_seconds * VideoSessionService.RATE_PER_SECOND, 2)
        
        # Ensure charge doesn't exceed locked amount
        final_charge = min(calculated_charge, session["locked_amount"])
        refund_amount = round(session["locked_amount"] - final_charge, 2)
        
        # Record charge payment (reduce lock, add actual charge)
        if final_charge > 0:
            charge_tx_id = PaymentService.generate_tx_id("charge")
            
            charge_payment = {
                "session_id": session["session_id"],
                "payment_type": "charge",
                "amount": final_charge,
                "from_user_id": user_id,
                "gateway_tx_id": charge_tx_id,
                "gateway_status": "completed",
                "completed_at": end_time.isoformat()
            }
            
            supabase.table("payments").insert(charge_payment).execute()
        
        # Record refund if any
        if refund_amount > 0:
            refund_tx_id = PaymentService.generate_tx_id("refund")
            
            refund_payment = {
                "session_id": session["session_id"],
                "payment_type": "refund",
                "amount": refund_amount,
                "to_user_id": user_id,
                "gateway_tx_id": refund_tx_id,
                "gateway_status": "completed",
                "completed_at": end_time.isoformat()
            }
            
            supabase.table("payments").insert(refund_payment).execute()
        
        # Calculate final balance
        final_balance = await WalletService.get_balance(user_id)
        
        # Remove session from active sessions
        del VideoSessionService._active_sessions[user_id]
        
        return {
            "session_id": session["session_id"],
            "duration_seconds": int(duration_seconds),
            "amount_charged": final_charge,
            "refund": refund_amount,
            "final_balance": final_balance,
            "ended_at": end_time.isoformat()
        }
    
    @staticmethod
    async def get_active_session(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's active session if exists"""
        if user_id in VideoSessionService._active_sessions:
            session = VideoSessionService._active_sessions[user_id]
            
            # Calculate current duration and cost
            current_time = datetime.utcnow()
            duration_seconds = (current_time - session["start_time"]).total_seconds()
            current_cost = round(duration_seconds * VideoSessionService.RATE_PER_SECOND, 2)
            
            return {
                "session_id": session["session_id"],
                "duration_seconds": int(duration_seconds),
                "current_cost": min(current_cost, session["locked_amount"]),
                "locked_amount": session["locked_amount"]
            }
        
        return None
