"""
Seed test user for video player demo
Creates a test user with ID 'ANNA_01' (matches VideoPlayer.tsx default)
"""
import asyncio
from database import supabase
from wallet_service import WalletService


async def seed_test_user():
    """Create test user and add initial wallet balance"""
    
    user_id = "ANNA_01"
    
    print("🌱 Seeding test user for video player demo...")
    
    try:
        # Check if user exists
        existing = supabase.table("users").select("id").eq("id", user_id).execute()
        
        if existing.data:
            print(f"✓ User {user_id} already exists")
        else:
            # Create test user
            user_data = {
                "id": user_id,
                "email": "anna@test.com",
                "name": "Anna Test User",
                "role": "student",
                "is_active": True
            }
            
            supabase.table("users").insert(user_data).execute()
            print(f"✓ Created test user: {user_id}")
        
        # Check current balance
        balance = await WalletService.get_balance(user_id)
        print(f"💰 Current balance: ₹{balance}")
        
        # Add initial funds if balance is low
        if balance < 100:
            deposit_amount = 100 - balance
            result = await WalletService.deposit(user_id, deposit_amount)
            print(f"✓ Added ₹{deposit_amount} to wallet")
            print(f"💰 New balance: ₹{result['new_balance']}")
        
        print("\n✅ Test user ready for video player!")
        print(f"   User ID: {user_id}")
        print(f"   Email: anna@test.com")
        print(f"   Balance: ₹{await WalletService.get_balance(user_id)}")
        
    except Exception as e:
        print(f"❌ Error seeding test user: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(seed_test_user())
