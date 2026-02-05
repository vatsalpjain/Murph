"""
Teacher Analytics Service
Provides comprehensive analytics for teacher dashboard including:
- Overall earnings and session statistics
- Lecture-wise earnings breakdown
- Student MCQ assessment scores
- Popular lectures metrics
"""
from typing import Dict, Any, List, Optional
from database import supabase
from datetime import datetime, timedelta


class TeacherAnalyticsService:
    """Analytics service for teacher dashboard"""
    
    @staticmethod
    async def get_teacher_id_from_user_id(user_id: str) -> Optional[str]:
        """Get teacher ID from user ID"""
        try:
            result = supabase.table("teachers")\
                .select("id")\
                .eq("user_id", user_id)\
                .single()\
                .execute()
            
            if result.data:
                return result.data["id"]
            return None
        except Exception as e:
            print(f"Error getting teacher ID: {str(e)}")
            return None
    
    @staticmethod
    async def get_dashboard_analytics(teacher_id: str) -> Dict[str, Any]:
        """
        Get overall teacher dashboard analytics
        Returns: total earnings, monthly earnings, session stats, ratings
        """
        try:
            # Get teacher profile for basic stats
            teacher_profile = supabase.table("teachers")\
                .select("*")\
                .eq("id", teacher_id)\
                .single()\
                .execute()
            
            if not teacher_profile.data:
                raise ValueError("Teacher not found")
            
            # Get all completed sessions for this teacher
            sessions = supabase.table("sessions")\
                .select("*")\
                .eq("teacher_id", teacher_id)\
                .eq("status", "completed")\
                .execute()
            
            total_sessions = len(sessions.data) if sessions.data else 0
            
            # Calculate total earnings from completed sessions
            total_earnings = sum(
                float(session.get("final_cost", 0) or 0) 
                for session in (sessions.data or [])
            )
            
            # Calculate monthly earnings (last 30 days)
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            monthly_sessions = [
                s for s in (sessions.data or [])
                if s.get("created_at", "") >= thirty_days_ago
            ]
            monthly_earnings = sum(
                float(session.get("final_cost", 0) or 0)
                for session in monthly_sessions
            )
            
            # Get quality bonuses
            quality_bonuses = teacher_profile.data.get("quality_bonus_earned", 0) or 0
            
            # Get unique students count
            unique_students = len(set(
                s["student_id"] for s in (sessions.data or [])
            )) if sessions.data else 0
            
            return {
                "total_earnings": round(float(total_earnings), 2),
                "monthly_earnings": round(float(monthly_earnings), 2),
                "quality_bonus_earned": round(float(quality_bonuses), 2),
                "total_sessions": total_sessions,
                "total_students": unique_students,
                "average_rating": float(teacher_profile.data.get("average_rating", 0) or 0),
                "total_reviews": teacher_profile.data.get("total_reviews", 0) or 0,
                "is_verified": teacher_profile.data.get("is_verified", False)
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get dashboard analytics: {str(e)}")
    
    @staticmethod
    async def get_lecture_wise_earnings(teacher_id: str) -> List[Dict[str, Any]]:
        """
        Get earnings breakdown by course/lecture
        Returns: Array of courses with earnings details
        """
        try:
            # Get all courses for this teacher
            courses = supabase.table("courses")\
                .select("id, title, category, price_per_minute, content_structure")\
                .eq("teacher_id", teacher_id)\
                .execute()
            
            if not courses.data:
                return []
            
            lecture_earnings = []
            
            for course in courses.data:
                # Get sessions for this course
                sessions = supabase.table("sessions")\
                    .select("*")\
                    .eq("course_id", course["id"])\
                    .eq("status", "completed")\
                    .execute()
                
                num_sessions = len(sessions.data) if sessions.data else 0
                
                # Calculate total earnings for this course
                total_course_earnings = sum(
                    float(s.get("final_cost", 0) or 0)
                    for s in (sessions.data or [])
                )
                
                # Get unique students
                unique_students = len(set(
                    s["student_id"] for s in (sessions.data or [])
                )) if sessions.data else 0
                
                # Calculate average earnings per session
                avg_earnings = (
                    total_course_earnings / num_sessions 
                    if num_sessions > 0 else 0
                )
                
                # Get lecture count from content_structure
                content_structure = course.get("content_structure", {})
                lectures = content_structure.get("lectures", []) if content_structure else []
                num_lectures = len(lectures)
                
                lecture_earnings.append({
                    "course_id": course["id"],
                    "course_title": course["title"],
                    "category": course["category"],
                    "num_lectures": num_lectures,
                    "total_sessions": num_sessions,
                    "total_students": unique_students,
                    "total_earnings": round(float(total_course_earnings), 2),
                    "avg_earnings_per_session": round(float(avg_earnings), 2),
                    "price_per_minute": float(course.get("price_per_minute", 0))
                })
            
            # Sort by total earnings descending
            lecture_earnings.sort(key=lambda x: x["total_earnings"], reverse=True)
            
            return lecture_earnings
            
        except Exception as e:
            raise ValueError(f"Failed to get lecture-wise earnings: {str(e)}")
    
    @staticmethod
    async def get_student_mcq_scores(
        teacher_id: str, 
        course_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get student MCQ assessment scores
        Returns: Array of student scores with discount eligibility flags
        """
        try:
            # Build query for sessions
            query = supabase.table("sessions")\
                .select("*, users!sessions_student_id_fkey(name, email), courses!inner(title)")\
                .eq("teacher_id", teacher_id)\
                .eq("assessment_taken", True)\
                .eq("status", "completed")
            
            # Filter by course if provided
            if course_id:
                query = query.eq("course_id", course_id)
            
            sessions = query.execute()
            
            if not sessions.data:
                return []
            
            student_scores = []
            
            for session in sessions.data:
                score = session.get("assessment_score")
                if score is None:
                    continue
                
                # Determine discount eligibility (score >= 90)
                discount_eligible = score >= 90
                
                student_info = session.get("users", {})
                course_info = session.get("courses", {})
                
                student_scores.append({
                    "session_id": session["id"],
                    "student_name": student_info.get("name", "Unknown"),
                    "student_email": student_info.get("email", ""),
                    "course_title": course_info.get("title", "Unknown Course"),
                    "assessment_score": score,
                    "discount_eligible": discount_eligible,
                    "session_date": session.get("created_at"),
                    "duration_seconds": session.get("duration_seconds", 0)
                })
            
            # Sort by score descending
            student_scores.sort(key=lambda x: x["assessment_score"], reverse=True)
            
            return student_scores
            
        except Exception as e:
            raise ValueError(f"Failed to get student MCQ scores: {str(e)}")
    
    @staticmethod
    async def get_popular_lectures(teacher_id: str) -> List[Dict[str, Any]]:
        """
        Get popular lectures analytics
        Returns: Array of courses sorted by popularity (enrollments)
        """
        try:
            # Get all courses for this teacher
            courses = supabase.table("courses")\
                .select("*")\
                .eq("teacher_id", teacher_id)\
                .execute()
            
            if not courses.data:
                return []
            
            popular_lectures = []
            
            for course in courses.data:
                # Get sessions for enrollment count
                sessions = supabase.table("sessions")\
                    .select("student_id, final_cost, status")\
                    .eq("course_id", course["id"])\
                    .execute()
                
                # Count unique students (enrollments)
                enrollments = len(set(
                    s["student_id"] for s in (sessions.data or [])
                )) if sessions.data else 0
                
                # Count completed sessions
                completed = len([
                    s for s in (sessions.data or [])
                    if s.get("status") == "completed"
                ]) if sessions.data else 0
                
                # Calculate completion rate
                total_sessions = len(sessions.data) if sessions.data else 0
                completion_rate = (
                    (completed / total_sessions * 100)
                    if total_sessions > 0 else 0
                )
                
                # Calculate total revenue
                total_revenue = sum(
                    float(s.get("final_cost", 0) or 0)
                    for s in (sessions.data or [])
                    if s.get("status") == "completed"
                )
                
                popular_lectures.append({
                    "course_id": course["id"],
                    "course_title": course["title"],
                    "category": course["category"],
                    "total_enrollments": enrollments,
                    "total_sessions": total_sessions,
                    "completed_sessions": completed,
                    "completion_rate": round(float(completion_rate), 1),
                    "total_revenue": round(float(total_revenue), 2),
                    "average_rating": float(course.get("average_rating", 0) or 0),
                    "total_reviews": course.get("total_reviews", 0) or 0,
                    "is_active": course.get("is_active", True)
                })
            
            # Sort by enrollments descending
            popular_lectures.sort(key=lambda x: x["total_enrollments"], reverse=True)
            
            return popular_lectures
            
        except Exception as e:
            raise ValueError(f"Failed to get popular lectures: {str(e)}")
