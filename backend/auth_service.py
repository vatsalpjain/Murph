"""
Authentication Service - Supabase Auth Integration
Handles user registration, login, OAuth, and session management
"""
import os
from typing import Dict, Any, Optional
from datetime import datetime
from supabase import Client
from database import supabase
from dotenv import load_dotenv

load_dotenv()


class AuthService:
    """Manages user authentication via Supabase Auth"""
    
    @staticmethod
    async def signup_with_email(
        email: str, 
        password: str, 
        name: str, 
        role: str
    ) -> Dict[str, Any]:
        """
        Register new user with email/password
        Creates auth user and profile in users table
        """
        try:
            # Create auth user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name,
                        "role": role
                    }
                }
            })
            
            if not auth_response.user:
                raise ValueError("Failed to create user account")
            
            user_id = auth_response.user.id
            
            # Create user profile in public.users table
            user_data = {
                "id": user_id,
                "email": email,
                "name": name,
                "role": role,
                "is_active": True
            }
            
            supabase.table("users").insert(user_data).execute()
            
            # If teacher, create teacher profile
            if role == "teacher":
                teacher_data = {
                    "user_id": user_id,
                    "bio": "",
                    "expertise_areas": [],
                    "is_verified": False
                }
                supabase.table("teachers").insert(teacher_data).execute()
            
            return {
                "user": {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "role": role
                },
                "session": auth_response.session,
                "message": "Account created successfully"
            }
            
        except Exception as e:
            raise ValueError(f"Signup failed: {str(e)}")
    
    @staticmethod
    async def login_with_email(email: str, password: str) -> Dict[str, Any]:
        """
        Login user with email/password
        Returns user profile and session tokens
        """
        try:
            # Check for hardcoded test credentials (for development only)
            if email == "admin@test.com" and password == "admin123":
                # Create a mock session for test admin user
                return {
                    "user": {
                        "id": "test-admin-001",
                        "email": "admin@test.com",
                        "name": "Admin User",
                        "role": "student",
                        "is_active": True,
                        "created_at": datetime.utcnow().isoformat(),
                        "wallet_address": None
                    },
                    "session": {
                        "access_token": "test-token-admin",
                        "refresh_token": "test-refresh-token",
                        "expires_in": 3600,
                        "token_type": "bearer"
                    },
                    "message": "Login successful (test credentials)"
                }
            
            # Authenticate with Supabase
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                raise ValueError("Invalid email or password")
            
            # Get user profile from database
            user_profile = supabase.table("users")\
                .select("*")\
                .eq("id", auth_response.user.id)\
                .single()\
                .execute()
            
            if not user_profile.data:
                raise ValueError("User profile not found")
            
            return {
                "user": user_profile.data,
                "session": auth_response.session,
                "message": "Login successful"
            }
            
        except Exception as e:
            raise ValueError(f"Login failed: {str(e)}")
    
    @staticmethod
    async def login_with_google(google_token: str) -> Dict[str, Any]:
        """
        Login/signup with Google OAuth
        Creates user profile if first time login
        """
        try:
            # Exchange Google token for Supabase session
            auth_response = supabase.auth.sign_in_with_id_token({
                "provider": "google",
                "token": google_token
            })
            
            if not auth_response.user:
                raise ValueError("Google authentication failed")
            
            user_id = auth_response.user.id
            email = auth_response.user.email
            name = auth_response.user.user_metadata.get("full_name", email.split("@")[0])
            
            # Check if user profile exists
            existing_user = supabase.table("users")\
                .select("*")\
                .eq("id", user_id)\
                .execute()
            
            if not existing_user.data:
                # First time Google login - create profile
                # Default to student role (can be changed later in onboarding)
                user_data = {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "role": "student",  # Default for OAuth users
                    "is_active": True
                }
                
                supabase.table("users").insert(user_data).execute()
                
                user_profile = user_data
            else:
                user_profile = existing_user.data[0]
            
            return {
                "user": user_profile,
                "session": auth_response.session,
                "message": "Google login successful",
                "is_new_user": not existing_user.data
            }
            
        except Exception as e:
            raise ValueError(f"Google login failed: {str(e)}")
    
    @staticmethod
    async def get_current_user(user_id: str) -> Dict[str, Any]:
        """
        Get current user profile by user_id
        Returns full user data from database
        """
        try:
            # Handle test admin user
            if user_id == "test-admin-001":
                return {
                    "id": "test-admin-001",
                    "email": "admin@test.com",
                    "name": "Admin User",
                    "role": "student",
                    "is_active": True,
                    "created_at": datetime.utcnow().isoformat(),
                    "wallet_address": None
                }
            
            # Get full user profile
            user_profile = supabase.table("users")\
                .select("*")\
                .eq("id", user_id)\
                .single()\
                .execute()
            
            if not user_profile.data:
                raise ValueError("User profile not found")
            
            return user_profile.data
            
        except Exception as e:
            raise ValueError(f"Failed to get user: {str(e)}")
    
    @staticmethod
    async def logout(access_token: str) -> Dict[str, Any]:
        """
        Logout user and invalidate session
        """
        try:
            # Sign out from Supabase
            supabase.auth.sign_out()
            
            return {"message": "Logout successful"}
            
        except Exception as e:
            raise ValueError(f"Logout failed: {str(e)}")
    
    @staticmethod
    async def verify_token(access_token: str) -> Optional[str]:
        """
        Verify JWT token and return user_id if valid
        Used for middleware authentication
        """
        try:
            # Handle test token for development
            if access_token == "test-token-admin":
                return "test-admin-001"
            
            user_response = supabase.auth.get_user(access_token)
            
            if user_response.user:
                return user_response.user.id
            
            return None
            
        except Exception:
            return None
    
    @staticmethod
    async def update_user_role(user_id: str, new_role: str) -> Dict[str, Any]:
        """
        Update user role (student <-> teacher)
        Creates teacher profile if upgrading to teacher
        """
        try:
            if new_role not in ["student", "teacher"]:
                raise ValueError("Invalid role. Must be 'student' or 'teacher'")
            
            # Update user role
            supabase.table("users")\
                .update({"role": new_role})\
                .eq("id", user_id)\
                .execute()
            
            # If upgrading to teacher, create teacher profile
            if new_role == "teacher":
                existing_teacher = supabase.table("teachers")\
                    .select("id")\
                    .eq("user_id", user_id)\
                    .execute()
                
                if not existing_teacher.data:
                    teacher_data = {
                        "user_id": user_id,
                        "bio": "",
                        "expertise_areas": [],
                        "is_verified": False
                    }
                    supabase.table("teachers").insert(teacher_data).execute()
            
            return {"message": f"Role updated to {new_role}"}
            
        except Exception as e:
            raise ValueError(f"Failed to update role: {str(e)}")
