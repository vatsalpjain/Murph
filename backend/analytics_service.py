"""
Analytics Service - Provides user statistics and activity data
Calculates watch streaks, domain analytics, and session history
"""
from datetime import datetime, timedelta
from typing import Dict, Any, List
from database import supabase
from collections import defaultdict


# Mock data for test user (development only)
TEST_USER_ID = "test-admin-001"


class AnalyticsService:
    """Manages user analytics and statistics"""
    
    @staticmethod
    async def get_user_analytics(user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive user analytics
        Returns: total watch time, videos watched, current streak, active domains
        """
        # Return mock data for test user
        if user_id == TEST_USER_ID:
            return {
                "total_hours_watched": 24.5,
                "total_videos_watched": 42,
                "current_streak": 7,
                "longest_streak": 14,
                "active_domains": 5
            }
        
        try:
            # Fetch all completed sessions for the user
            sessions_response = supabase.table("sessions")\
                .select("*, courses(category, title)")\
                .eq("student_id", user_id)\
                .eq("status", "completed")\
                .execute()
            
            sessions = sessions_response.data or []
            
            if not sessions:
                return {
                    "total_hours_watched": 0,
                    "total_videos_watched": 0,
                    "current_streak": 0,
                    "longest_streak": 0,
                    "active_domains": 0
                }
            
            # Calculate total watch time (sum of duration_seconds)
            total_seconds = sum(s.get("duration_seconds", 0) for s in sessions)
            total_hours = round(total_seconds / 3600, 1)
            
            # Count unique videos/courses
            total_videos = len(sessions)
            
            # Calculate watch streak
            streak_data = await AnalyticsService.calculate_streak(sessions)
            
            # Count active domains (unique categories)
            unique_domains = set()
            for session in sessions:
                if session.get("courses") and session["courses"].get("category"):
                    unique_domains.add(session["courses"]["category"])
            
            return {
                "total_hours_watched": total_hours,
                "total_videos_watched": total_videos,
                "current_streak": streak_data["current_streak"],
                "longest_streak": streak_data["longest_streak"],
                "active_domains": len(unique_domains)
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get user analytics: {str(e)}")
    
    @staticmethod
    async def calculate_streak(sessions: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Calculate current and longest watch streak from sessions
        A streak is consecutive days with at least one completed session
        """
        if not sessions:
            return {"current_streak": 0, "longest_streak": 0}
        
        # Extract unique dates (ignore time)
        watch_dates = set()
        for session in sessions:
            if session.get("end_time"):
                # Parse ISO format datetime
                date_obj = datetime.fromisoformat(session["end_time"].replace('Z', '+00:00'))
                watch_dates.add(date_obj.date())
        
        if not watch_dates:
            return {"current_streak": 0, "longest_streak": 0}
        
        # Sort dates
        sorted_dates = sorted(watch_dates, reverse=True)
        
        # Calculate current streak (from today backwards)
        today = datetime.utcnow().date()
        current_streak = 0
        
        # Check if watched today or yesterday (streak is still active)
        if sorted_dates[0] >= today - timedelta(days=1):
            current_date = sorted_dates[0]
            current_streak = 1
            
            for i in range(1, len(sorted_dates)):
                expected_date = current_date - timedelta(days=1)
                if sorted_dates[i] == expected_date:
                    current_streak += 1
                    current_date = sorted_dates[i]
                elif sorted_dates[i] < expected_date:
                    break
        
        # Calculate longest streak
        longest_streak = 0
        temp_streak = 1
        
        for i in range(len(sorted_dates) - 1):
            if sorted_dates[i] - sorted_dates[i + 1] == timedelta(days=1):
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak)
        
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak
        }
    
    @staticmethod
    async def get_watch_calendar(user_id: str, days: int = 28) -> Dict[str, Any]:
        """
        Get watch calendar data for the last N days
        Returns array of days with watched status
        """
        # Return mock data for test user
        if user_id == TEST_USER_ID:
            today = datetime.utcnow().date()
            calendar_days = []
            for i in range(days - 1, -1, -1):
                date = today - timedelta(days=i)
                # Mock: watched on random days (simulate a 7-day streak)
                watched = i < 7 or (i % 3 == 0)
                calendar_days.append({
                    "day": date.day,
                    "date": date.isoformat(),
                    "watched": watched
                })
            return {
                "calendar_days": calendar_days,
                "current_streak": 7,
                "longest_streak": 14
            }
        
        try:
            # Fetch sessions from last N days
            start_date = datetime.utcnow() - timedelta(days=days - 1)
            
            sessions_response = supabase.table("sessions")\
                .select("end_time")\
                .eq("student_id", user_id)\
                .eq("status", "completed")\
                .gte("end_time", start_date.isoformat())\
                .execute()
            
            sessions = sessions_response.data or []
            
            # Extract watched dates
            watched_dates = set()
            for session in sessions:
                if session.get("end_time"):
                    date_obj = datetime.fromisoformat(session["end_time"].replace('Z', '+00:00'))
                    watched_dates.add(date_obj.date())
            
            # Calculate streak
            all_sessions = supabase.table("sessions")\
                .select("end_time")\
                .eq("student_id", user_id)\
                .eq("status", "completed")\
                .execute()
            
            streak_info = await AnalyticsService.calculate_streak(all_sessions.data or [])
            
            # Build calendar array
            calendar_days = []
            today = datetime.utcnow().date()
            
            for i in range(days - 1, -1, -1):
                date = today - timedelta(days=i)
                calendar_days.append({
                    "day": date.day,
                    "date": date.isoformat(),
                    "watched": date in watched_dates
                })
            
            return {
                "calendar_days": calendar_days,
                "current_streak": streak_info["current_streak"],
                "longest_streak": streak_info["longest_streak"]
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get watch calendar: {str(e)}")
    
    @staticmethod
    async def get_domain_analytics(user_id: str) -> Dict[str, Any]:
        """
        Get domain/category-wise analytics
        Returns hours per domain and weekly breakdown
        """
        # Return mock data for test user
        if user_id == TEST_USER_ID:
            return {
                "domains": [
                    {"name": "Web Development", "hours": 8.5, "color": "bg-blue-500"},
                    {"name": "Machine Learning", "hours": 6.2, "color": "bg-orange-500"},
                    {"name": "Data Structures", "hours": 4.8, "color": "bg-green-500"},
                    {"name": "Computer Science", "hours": 3.0, "color": "bg-purple-500"},
                    {"name": "Design", "hours": 2.0, "color": "bg-yellow-500"},
                ],
                "weekly_data": [
                    {"day": "Mon", "hours": 2.5},
                    {"day": "Tue", "hours": 3.0},
                    {"day": "Wed", "hours": 1.5},
                    {"day": "Thu", "hours": 4.0},
                    {"day": "Fri", "hours": 2.0},
                    {"day": "Sat", "hours": 5.5},
                    {"day": "Sun", "hours": 3.5},
                ]
            }
        
        try:
            # Fetch completed sessions with course data
            sessions_response = supabase.table("sessions")\
                .select("duration_seconds, end_time, courses(category, title)")\
                .eq("student_id", user_id)\
                .eq("status", "completed")\
                .execute()
            
            sessions = sessions_response.data or []
            
            if not sessions:
                return {
                    "domains": [],
                    "weekly_data": []
                }
            
            # Calculate domain-wise hours
            domain_hours = defaultdict(float)
            for session in sessions:
                if session.get("courses") and session["courses"].get("category"):
                    category = session["courses"]["category"]
                    hours = session.get("duration_seconds", 0) / 3600
                    domain_hours[category] += hours
            
            domains = [
                {
                    "name": domain,
                    "hours": round(hours, 1),
                    "color": AnalyticsService.get_domain_color(domain)
                }
                for domain, hours in sorted(domain_hours.items(), key=lambda x: x[1], reverse=True)
            ]
            
            # Calculate weekly data (last 7 days)
            weekly_hours = defaultdict(float)
            days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            today = datetime.utcnow().date()
            
            for session in sessions:
                if session.get("end_time"):
                    date_obj = datetime.fromisoformat(session["end_time"].replace('Z', '+00:00'))
                    session_date = date_obj.date()
                    
                    # Only include last 7 days
                    if (today - session_date).days < 7:
                        day_name = days_of_week[session_date.weekday()]
                        hours = session.get("duration_seconds", 0) / 3600
                        weekly_hours[day_name] += hours
            
            # Build weekly array (always 7 days)
            weekly_data = [
                {
                    "day": day,
                    "hours": round(weekly_hours.get(day, 0), 1)
                }
                for day in days_of_week
            ]
            
            return {
                "domains": domains,
                "weekly_data": weekly_data
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get domain analytics: {str(e)}")
    
    @staticmethod
    def get_domain_color(domain: str) -> str:
        """Map domain/category to color for consistent UI"""
        color_map = {
            "DSA": "bg-green-500",
            "Data Structures": "bg-green-500",
            "Algorithms": "bg-green-500",
            "Web Dev": "bg-blue-500",
            "Web Development": "bg-blue-500",
            "Frontend": "bg-blue-500",
            "Backend": "bg-indigo-500",
            "AI/ML": "bg-orange-500",
            "Machine Learning": "bg-orange-500",
            "Artificial Intelligence": "bg-orange-500",
            "Core CS": "bg-purple-500",
            "Computer Science": "bg-purple-500",
            "Operating Systems": "bg-purple-500",
            "Music": "bg-pink-500",
            "Fitness": "bg-red-500",
            "Design": "bg-yellow-500"
        }
        return color_map.get(domain, "bg-slate-500")
    
    @staticmethod
    async def get_user_sessions(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get user's session history with course details
        Returns recent sessions with progress and payment info
        """
        # Return mock data for test user
        if user_id == TEST_USER_ID:
            return [
                {
                    "id": "mock-session-1",
                    "title": "React Advanced Patterns",
                    "domain": "Web Development",
                    "duration": "45:00",
                    "watched": "32:15",
                    "date": "Today",
                    "progress": 72,
                    "status": "completed"
                },
                {
                    "id": "mock-session-2",
                    "title": "Neural Networks Deep Dive",
                    "domain": "Machine Learning",
                    "duration": "60:00",
                    "watched": "60:00",
                    "date": "Yesterday",
                    "progress": 100,
                    "status": "completed"
                },
                {
                    "id": "mock-session-3",
                    "title": "Binary Trees & Graphs",
                    "domain": "Data Structures",
                    "duration": "30:00",
                    "watched": "18:45",
                    "date": "2 days ago",
                    "progress": 63,
                    "status": "completed"
                },
                {
                    "id": "mock-session-4",
                    "title": "System Design Basics",
                    "domain": "Computer Science",
                    "duration": "55:00",
                    "watched": "55:00",
                    "date": "3 days ago",
                    "progress": 100,
                    "status": "completed"
                },
            ]
        
        try:
            # Fetch sessions with course information
            sessions_response = supabase.table("sessions")\
                .select("*, courses(id, title, category, total_duration_minutes)")\
                .eq("student_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            sessions = sessions_response.data or []
            
            # Format session data for frontend
            formatted_sessions = []
            for session in sessions:
                course = session.get("courses", {})
                duration_seconds = session.get("duration_seconds", 0)
                total_duration = course.get("total_duration_minutes", 1) * 60  # Convert to seconds
                
                # Calculate progress percentage
                progress = min(100, round((duration_seconds / total_duration) * 100)) if total_duration > 0 else 0
                
                # Format duration as MM:SS
                watched_minutes = duration_seconds // 60
                watched_seconds = duration_seconds % 60
                watched_time = f"{watched_minutes}:{watched_seconds:02d}"
                
                total_mins = course.get("total_duration_minutes", 0)
                total_time = f"{total_mins}:00"
                
                # Determine date label
                end_time = session.get("end_time")
                date_label = "Unknown"
                if end_time:
                    date_obj = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                    days_ago = (datetime.utcnow() - date_obj).days
                    
                    if days_ago == 0:
                        date_label = "Today"
                    elif days_ago == 1:
                        date_label = "Yesterday"
                    elif days_ago < 7:
                        date_label = f"{days_ago} days ago"
                    else:
                        date_label = date_obj.strftime("%b %d, %Y")
                
                formatted_sessions.append({
                    "id": session.get("id"),
                    "title": course.get("title", "Untitled Course"),
                    "domain": course.get("category", "General"),
                    "duration": total_time,
                    "watched": watched_time,
                    "date": date_label,
                    "progress": progress,
                    "status": session.get("status", "unknown")
                })
            
            return formatted_sessions
            
        except Exception as e:
            raise ValueError(f"Failed to get user sessions: {str(e)}")
