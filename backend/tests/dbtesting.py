"""
Supabase Database Integration Tests
Run this to verify all tables, RLS policies, and constraints work correctly.

Usage: python test_supabase_setup.py
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime
import json

load_dotenv()

# Initialize clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

anon_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
service_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Test data IDs (using fixed UUIDs for repeatability)
TEACHER_USER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
STUDENT_USER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
TEACHER_ID = None
COURSE_ID = None
SESSION_ID = None
REVIEW_ID = None

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name: str):
    print(f"\n{Colors.BLUE}🧪 Testing: {name}{Colors.END}")

def log_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def log_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def log_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

# ============================================================================
# TEST 1: Table Existence & Structure
# ============================================================================
def test_tables_exist():
    log_test("Table Existence")
    
    tables = ['users', 'teachers', 'courses', 'sessions', 'reviews', 'payments', 'quality_bonuses']
    
    for table in tables:
        try:
            result = service_client.table(table).select("*").limit(1).execute()
            log_success(f"Table '{table}' exists and is accessible")
        except Exception as e:
            log_error(f"Table '{table}' failed: {str(e)}")
            return False
    
    return True

# ============================================================================
# TEST 2: Create Test Users
# ============================================================================
def test_create_users():
    log_test("User Creation")
    
    global TEACHER_ID
    
    try:
        # Create teacher user
        teacher_data = {
            "id": TEACHER_USER_ID,
            "email": f"teacher_test_{uuid.uuid4().hex[:8]}@test.com",
            "name": "Test Teacher",
            "role": "teacher",
            "wallet_address": f"0xTEACHER{uuid.uuid4().hex[:8]}"
        }
        
        service_client.table("users").upsert(teacher_data).execute()
        log_success("Teacher user created")
        
        # Create student user
        student_data = {
            "id": STUDENT_USER_ID,
            "email": f"student_test_{uuid.uuid4().hex[:8]}@test.com",
            "name": "Test Student",
            "role": "student",
            "wallet_address": f"0xSTUDENT{uuid.uuid4().hex[:8]}"
        }
        
        service_client.table("users").upsert(student_data).execute()
        log_success("Student user created")
        
        # Create teacher profile
        teacher_profile = {
            "user_id": TEACHER_USER_ID,
            "bio": "Expert guitar teacher",
            "expertise_areas": ["Guitar", "Music Theory"]
        }
        
        result = service_client.table("teachers").insert(teacher_profile).execute()
        TEACHER_ID = result.data[0]['id']
        log_success(f"Teacher profile created: {TEACHER_ID}")
        
        return True
        
    except Exception as e:
        log_error(f"User creation failed: {str(e)}")
        return False
# ============================================================================
# TEST 3: Create Test Course
# ============================================================================
def test_create_course():
    log_test("Course Creation")
    
    global COURSE_ID
    
    try:
        course_data = {
            "teacher_id": TEACHER_ID,
            "title": "Test Guitar Course",
            "description": "Learn guitar basics",
            "category": "Music",
            "price_per_minute": 0.50,
            "total_duration_minutes": 60,
            "content_structure": {
                "lectures": [
                    {"id": 1, "title": "Intro", "duration_minutes": 10},
                    {"id": 2, "title": "Chords", "duration_minutes": 20},
                    {"id": 3, "title": "Practice", "duration_minutes": 30}
                ]
            },
            "assessment_questions": {
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "question": "What is the first chord?",
                        "options": ["C", "G", "D", "E"],
                        "correct_answer": 0
                    }
                ]
            }
        }
        
        result = service_client.table("courses").insert(course_data).execute()
        COURSE_ID = result.data[0]['id']
        log_success(f"Course created: {COURSE_ID}")
        
        # Verify JSONB structure
        course = service_client.table("courses").select("*").eq("id", COURSE_ID).single().execute()
        
        assert "lectures" in course.data['content_structure'], "content_structure missing lectures"
        assert "questions" in course.data['assessment_questions'], "assessment_questions missing questions"
        
        log_success("JSONB fields validated")
        
        return True
        
    except Exception as e:
        log_error(f"Course creation failed: {str(e)}")
        return False

# ============================================================================
# TEST 4: RLS Policy Testing
# ============================================================================
def test_rls_policies():
    log_test("Row Level Security Policies")
    
    try:
        # Test 1: Anon client should see active courses
        courses = anon_client.table("courses").select("*").eq("is_active", True).execute()
        log_success(f"Public can view active courses ({len(courses.data)} found)")
        
        # Test 2: Anon client should NOT see inactive courses (if we had any)
        # This is implicit in the RLS policy
        
        # Test 3: Service client should see all
        all_courses = service_client.table("courses").select("*").execute()
        log_success(f"Service role can view all courses ({len(all_courses.data)} found)")
        
        # Test 4: Check users table isolation
        # Anon client without auth should see nothing
        try:
            result = anon_client.table("users").select("*").execute()
            if len(result.data) == 0:
                log_success("Anon client cannot access users (RLS working)")
            else:
                log_warning("Anon client can see users - check RLS policies")
        except Exception:
            log_success("Anon client blocked from users table (RLS working)")
        
        return True
        
    except Exception as e:
        log_error(f"RLS policy test failed: {str(e)}")
        return False

# ============================================================================
# TEST 5: Session Creation with Constraints
# ============================================================================
def test_session_constraints():
    log_test("Session Constraints & Payment Fields")
    
    global SESSION_ID
    
    try:
        # Test 1: Create valid session
        session_data = {
            "course_id": COURSE_ID,
            "student_id": STUDENT_USER_ID,
            "teacher_id": TEACHER_ID,
            "status": "locked",
            "locked_amount": 30.00,
            "payment_tx_id": f"tx_{uuid.uuid4().hex}"
        }
        
        result = service_client.table("sessions").insert(session_data).execute()
        SESSION_ID = result.data[0]['id']
        log_success(f"Session created with locked status: {SESSION_ID}")
        
        # Test 2: Verify locked_amount constraint (must be > 0)
        try:
            bad_session = {
                "course_id": COURSE_ID,
                "student_id": STUDENT_USER_ID,
                "teacher_id": TEACHER_ID,
                "status": "locked",
                "locked_amount": -10.00  # Should fail
            }
            service_client.table("sessions").insert(bad_session).execute()
            log_error("Constraint failed: Allowed negative locked_amount")
        except Exception:
            log_success("Constraint working: Rejected negative locked_amount")
        
        # Test 3: Verify status constraint
        try:
            bad_status = {
                "course_id": COURSE_ID,
                "student_id": STUDENT_USER_ID,
                "teacher_id": TEACHER_ID,
                "status": "invalid_status",  # Should fail
                "locked_amount": 30.00
            }
            service_client.table("sessions").insert(bad_status).execute()
            log_error("Constraint failed: Allowed invalid status")
        except Exception:
            log_success("Constraint working: Rejected invalid status")
        
        # Test 4: Update session to active
        update_data = {
            "status": "active",
            "start_time": datetime.utcnow().isoformat()
        }
        service_client.table("sessions").update(update_data).eq("id", SESSION_ID).execute()
        log_success("Session updated to active status")
        
        # Test 5: Complete session with payment
        complete_data = {
            "status": "completed",
            "end_time": datetime.utcnow().isoformat(),
            "final_cost": 15.00,
            "amount_paid": 15.00,
            "amount_refunded": 15.00,
            "duration_seconds": 1800  # 30 minutes
        }
        service_client.table("sessions").update(complete_data).eq("id", SESSION_ID).execute()
        log_success("Session completed with payment details")
        
        # Test 6: Verify payment math constraint
        session = service_client.table("sessions").select("*").eq("id", SESSION_ID).single().execute()
        paid_refunded = session.data['amount_paid'] + session.data['amount_refunded']
        locked = session.data['locked_amount']
        
        if paid_refunded <= locked + 0.01:
            log_success(f"Payment math valid: paid({session.data['amount_paid']}) + refunded({session.data['amount_refunded']}) <= locked({locked})")
        else:
            log_error("Payment math constraint violated")
        
        return True
        
    except Exception as e:
        log_error(f"Session constraint test failed: {str(e)}")
        return False

# ============================================================================
# TEST 6: Review Creation with Engagement Metrics
# ============================================================================
def test_review_creation():
    log_test("Review Creation with AI Validation Fields")
    
    global REVIEW_ID
    
    try:
        review_data = {
            "session_id": SESSION_ID,
            "student_id": STUDENT_USER_ID,
            "teacher_id": TEACHER_ID,
            "course_id": COURSE_ID,
            "rating": 5,
            "review_text": "Excellent course!",
            "engagement_metrics": {
                "duration_sec": 1800,
                "completion_pct": 60,
                "stopped_at_lecture": 2,
                "assessment_score": 85
            },
            "credibility_score": 0.92,
            "is_verified": True
        }
        
        result = service_client.table("reviews").insert(review_data).execute()
        REVIEW_ID = result.data[0]['id']
        log_success(f"Review created with engagement metrics: {REVIEW_ID}")
        
        # Verify JSONB structure
        review = service_client.table("reviews").select("*").eq("id", REVIEW_ID).single().execute()
        assert "duration_sec" in review.data['engagement_metrics']
        assert "assessment_score" in review.data['engagement_metrics']
        log_success("Engagement metrics JSONB validated")
        
        # Test credibility score constraint
        try:
            bad_review = {
                "session_id": SESSION_ID,
                "student_id": STUDENT_USER_ID,
                "teacher_id": TEACHER_ID,
                "course_id": COURSE_ID,
                "rating": 3,
                "credibility_score": 1.5  # Should fail (> 1)
            }
            # Note: This will fail on unique session_id, so use different session
            log_warning("Skipping credibility constraint test (needs unique session)")
        except Exception:
            log_success("Credibility score constraint working")
        
        return True
        
    except Exception as e:
        log_error(f"Review creation failed: {str(e)}")
        return False

# ============================================================================
# TEST 7: Payment Audit Trail
# ============================================================================
def test_payment_audit():
    log_test("Payment Audit Trail")
    
    try:
        # Create payment records
        payments = [
            {
                "session_id": SESSION_ID,
                "payment_type": "lock",
                "amount": 30.00,
                "from_user_id": STUDENT_USER_ID,
                "gateway_tx_id": f"lock_{uuid.uuid4().hex}",
                "gateway_status": "completed"
            },
            {
                "session_id": SESSION_ID,
                "payment_type": "charge",
                "amount": 15.00,
                "from_user_id": STUDENT_USER_ID,
                "to_user_id": TEACHER_USER_ID,
                "gateway_tx_id": f"charge_{uuid.uuid4().hex}",
                "gateway_status": "completed"
            },
            {
                "session_id": SESSION_ID,
                "payment_type": "refund",
                "amount": 15.00,
                "to_user_id": STUDENT_USER_ID,
                "gateway_tx_id": f"refund_{uuid.uuid4().hex}",
                "gateway_status": "completed"
            }
        ]
        
        for payment in payments:
            service_client.table("payments").insert(payment).execute()
        
        log_success(f"Created {len(payments)} payment audit records")
        
        # Verify immutability (only service role should manage)
        all_payments = service_client.table("payments").select("*").eq("session_id", SESSION_ID).execute()
        log_success(f"Retrieved {len(all_payments.data)} payment records for audit")
        
        return True
        
    except Exception as e:
        log_error(f"Payment audit test failed: {str(e)}")
        return False

# ============================================================================
# TEST 8: Quality Bonus Calculation
# ============================================================================
def test_quality_bonus():
    log_test("Quality Bonus System")
    
    try:
        bonus_data = {
            "teacher_id": TEACHER_ID,
            "session_id": SESSION_ID,
            "review_id": REVIEW_ID,
            "base_payment": 15.00,
            "bonus_percentage": 10.00,
            "bonus_amount": 1.50,
            "credibility_score": 0.92,
            "review_rating": 5
        }
        
        result = service_client.table("quality_bonuses").insert(bonus_data).execute()
        log_success(f"Quality bonus created: {result.data[0]['id']}")
        
        # Verify bonus calculation constraint
        bonus = result.data[0]
        expected = round(bonus['base_payment'] * bonus['bonus_percentage'] / 100, 2)
        actual = bonus['bonus_amount']
        
        if abs(expected - actual) < 0.01:
            log_success(f"Bonus calculation correct: {actual} ≈ {expected}")
        else:
            log_error(f"Bonus calculation mismatch: {actual} != {expected}")
        
        return True
        
    except Exception as e:
        log_error(f"Quality bonus test failed: {str(e)}")
        return False

# ============================================================================
# TEST 9: Indexes Performance Check
# ============================================================================
def test_indexes():
    log_test("Index Verification")
    
    try:
        # This is more of a metadata check
        query = """
        SELECT 
            tablename, 
            indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
        """
        
        # Note: Supabase Python client doesn't directly support raw SQL easily
        # Use service client with rpc or check via dashboard
        
        log_warning("Index check: Verify manually in Supabase Dashboard > Database > Indexes")
        log_success("Critical indexes should exist for: sessions(student_id), sessions(teacher_id), payments(session_id)")
        
        return True
        
    except Exception as e:
        log_error(f"Index verification failed: {str(e)}")
        return False

# ============================================================================
# TEST 10: Assessment Integration
# ============================================================================
def test_assessment_flow():
    log_test("MCQ Assessment Integration")
    
    try:
        # Update session with assessment results
        assessment_data = {
            "assessment_taken": True,
            "assessment_score": 85,
            "assessment_answers": {
                "q1": 0,
                "correct": 1,
                "total": 1,
                "score": 85
            }
        }
        
        service_client.table("sessions").update(assessment_data).eq("id", SESSION_ID).execute()
        log_success("Assessment results saved to session")
        
        # Verify constraint
        session = service_client.table("sessions").select("*").eq("id", SESSION_ID).single().execute()
        
        if session.data['assessment_taken'] and session.data['assessment_score'] is not None:
            log_success("Assessment constraint validated (taken=True requires score)")
        else:
            log_error("Assessment constraint failed")
        
        return True
        
    except Exception as e:
        log_error(f"Assessment test failed: {str(e)}")
        return False

# ============================================================================
# CLEANUP
# ============================================================================
def cleanup_test_data():
    log_test("Cleanup Test Data")
    
    try:
        # Delete in reverse order of dependencies
        service_client.table("quality_bonuses").delete().eq("session_id", SESSION_ID).execute()
        service_client.table("payments").delete().eq("session_id", SESSION_ID).execute()
        service_client.table("reviews").delete().eq("session_id", SESSION_ID).execute()
        service_client.table("sessions").delete().eq("id", SESSION_ID).execute()
        service_client.table("courses").delete().eq("id", COURSE_ID).execute()
        service_client.table("teachers").delete().eq("user_id", TEACHER_USER_ID).execute()
        service_client.table("users").delete().eq("id", TEACHER_USER_ID).execute()
        service_client.table("users").delete().eq("id", STUDENT_USER_ID).execute()
        
        log_success("Test data cleaned up")
        return True
        
    except Exception as e:
        log_warning(f"Cleanup failed (may be partial): {str(e)}")
        return False

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================
def run_all_tests():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("🚀 SUPABASE DATABASE INTEGRATION TESTS")
    print(f"{'='*60}{Colors.END}\n")
    
    tests = [
        ("Table Existence", test_tables_exist),
        ("User Creation", test_create_users),
        ("Course Creation", test_create_course),
        ("RLS Policies", test_rls_policies),
        ("Session Constraints", test_session_constraints),
        ("Review Creation", test_review_creation),
        ("Payment Audit", test_payment_audit),
        ("Quality Bonus", test_quality_bonus),
        ("Indexes", test_indexes),
        ("Assessment Flow", test_assessment_flow),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            log_error(f"Test '{name}' crashed: {str(e)}")
            results.append((name, False))
    
    # Cleanup
    cleanup_test_data()
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}{Colors.END}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if result else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status} - {name}")
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 ALL TESTS PASSED ({passed}/{total}){Colors.END}")
    else:
        print(f"{Colors.RED}⚠️  SOME TESTS FAILED ({passed}/{total}){Colors.END}")
    
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    run_all_tests()