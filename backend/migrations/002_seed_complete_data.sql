-- =====================================================
-- Murph Learning Platform - Complete Seed Data
-- Generated: 2026-02-05
-- Purpose: Populate all tables with realistic test data
-- NOTE: Excludes courses table (already seeded separately)
-- =====================================================

-- =====================================================
-- CLEANUP (Optional - Uncomment to reset)
-- =====================================================
-- DELETE FROM public.quality_bonuses;
-- DELETE FROM public.payments;
-- DELETE FROM public.reviews;
-- DELETE FROM public.sessions;
-- DELETE FROM public.teachers WHERE id != '00000000-0000-0000-0000-000000000002';
-- DELETE FROM public.users WHERE id != '00000000-0000-0000-0000-000000000001';


-- =====================================================
-- SECTION 1: STUDENT USERS
-- =====================================================

-- Student 1: Rahul Sharma
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'rahul.sharma@gmail.com',
    'Rahul Sharma',
    'student',
    '0xStudent001Rahul',
    TRUE,
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 2: Priya Patel
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000002',
    'priya.patel@gmail.com',
    'Priya Patel',
    'student',
    '0xStudent002Priya',
    TRUE,
    NOW() - INTERVAL '25 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 3: Amit Kumar
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000003',
    'amit.kumar@gmail.com',
    'Amit Kumar',
    'student',
    '0xStudent003Amit',
    TRUE,
    NOW() - INTERVAL '20 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 4: Sneha Reddy
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000004',
    'sneha.reddy@gmail.com',
    'Sneha Reddy',
    'student',
    '0xStudent004Sneha',
    TRUE,
    NOW() - INTERVAL '15 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 5: Vikram Singh
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000005',
    'vikram.singh@gmail.com',
    'Vikram Singh',
    'student',
    '0xStudent005Vikram',
    TRUE,
    NOW() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 6: Ananya Gupta
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000006',
    'ananya.gupta@gmail.com',
    'Ananya Gupta',
    'student',
    '0xStudent006Ananya',
    TRUE,
    NOW() - INTERVAL '8 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 7: Karthik Nair
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000007',
    'karthik.nair@gmail.com',
    'Karthik Nair',
    'student',
    '0xStudent007Karthik',
    TRUE,
    NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 8: Meera Krishnan
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000008',
    'meera.krishnan@gmail.com',
    'Meera Krishnan',
    'student',
    '0xStudent008Meera',
    TRUE,
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 9: Arjun Menon
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000009',
    'arjun.menon@gmail.com',
    'Arjun Menon',
    'student',
    '0xStudent009Arjun',
    TRUE,
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Student 10: Divya Iyer
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '10000000-0000-0000-0000-000000000010',
    'divya.iyer@gmail.com',
    'Divya Iyer',
    'student',
    '0xStudent010Divya',
    TRUE,
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 2: ADDITIONAL TEACHER USERS
-- =====================================================

-- Teacher 2: Dr. Anand Rao (AI/ML Expert)
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    'dr.anand.rao@murph.edu',
    'Dr. Anand Rao',
    'teacher',
    '0xTeacher002Anand',
    TRUE,
    NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

-- Teacher 3: Lakshmi Venkat (Art Instructor)
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '20000000-0000-0000-0000-000000000002',
    'lakshmi.venkat@murph.edu',
    'Lakshmi Venkat',
    'teacher',
    '0xTeacher003Lakshmi',
    TRUE,
    NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- Teacher 4: Prof. Suresh Kumar (History Expert)
INSERT INTO public.users (id, email, name, role, wallet_address, is_active, created_at)
VALUES (
    '20000000-0000-0000-0000-000000000003',
    'prof.suresh@murph.edu',
    'Prof. Suresh Kumar',
    'teacher',
    '0xTeacher004Suresh',
    TRUE,
    NOW() - INTERVAL '40 days'
) ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 3: TEACHER PROFILES
-- =====================================================

-- Teacher Profile 2: Dr. Anand Rao
INSERT INTO public.teachers (id, user_id, bio, expertise_areas, total_earnings, quality_bonus_earned, average_rating, total_sessions_completed, total_reviews, is_verified, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'PhD in Machine Learning from IIT Bombay. 15+ years of experience in AI research and education. Former Google AI researcher.',
    ARRAY['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'Data Science'],
    45000.00,
    5500.00,
    4.8,
    156,
    89,
    TRUE,
    NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

-- Teacher Profile 3: Lakshmi Venkat
INSERT INTO public.teachers (id, user_id, bio, expertise_areas, total_earnings, quality_bonus_earned, average_rating, total_sessions_completed, total_reviews, is_verified, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Award-winning artist with exhibitions in National Gallery. Specializes in traditional Indian art forms and modern digital art.',
    ARRAY['Drawing', 'Painting', 'Sketching', 'Digital Art', 'Art History'],
    32000.00,
    3800.00,
    4.6,
    98,
    67,
    TRUE,
    NOW() - INTERVAL '45 days'
) ON CONFLICT (id) DO NOTHING;

-- Teacher Profile 4: Prof. Suresh Kumar
INSERT INTO public.teachers (id, user_id, bio, expertise_areas, total_earnings, quality_bonus_earned, average_rating, total_sessions_completed, total_reviews, is_verified, created_at)
VALUES (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    'History professor at Delhi University for 20 years. Published author of 5 books on Indian and World History.',
    ARRAY['World History', 'Indian History', 'Ancient Civilizations', 'Modern History'],
    28000.00,
    3200.00,
    4.7,
    78,
    52,
    TRUE,
    NOW() - INTERVAL '40 days'
) ON CONFLICT (id) DO NOTHING;

-- Update existing Demo Teacher profile (from course seed)
UPDATE public.teachers 
SET 
    total_earnings = 67500.00,
    quality_bonus_earned = 8200.00,
    average_rating = 4.7,
    total_sessions_completed = 234,
    total_reviews = 156
WHERE id = '00000000-0000-0000-0000-000000000002';


-- =====================================================
-- SECTION 4: SESSIONS (Learning Sessions)
-- Reference existing courses by querying them
-- =====================================================

-- Helper: Get course IDs (run this to see your course IDs)
-- SELECT id, title FROM public.courses;

-- For this seed, we'll create sessions that reference courses by title pattern
-- Assuming courses exist from previous seed

-- Session 1: Rahul watching Cooking course (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id, refund_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000001',
    c.id,
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    500.00,
    375.00,
    375.00,
    125.00,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days' + INTERVAL '30 minutes',
    1800,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    85,
    'tx_pay_001',
    'tx_lock_001',
    'tx_refund_001',
    NOW() - INTERVAL '28 days'
FROM public.courses c
WHERE c.title LIKE '%Cooking%' OR c.title LIKE '%Recipe%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 2: Priya watching Medical course (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000002',
    c.id,
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    500.00,
    440.00,
    440.00,
    60.00,
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '24 days' + INTERVAL '35 minutes',
    2100,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    92,
    'tx_pay_002',
    'tx_lock_002',
    NOW() - INTERVAL '24 days'
FROM public.courses c
WHERE c.title LIKE '%Medical%' OR c.title LIKE '%MBBS%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 3: Amit watching 3D Sketching course (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000003',
    c.id,
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    300.00,
    250.00,
    250.00,
    50.00,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days' + INTERVAL '18 minutes',
    1080,
    '{"stopped_at_lecture": 4, "completion_pct": 100}'::jsonb,
    TRUE,
    78,
    'tx_pay_003',
    'tx_lock_003',
    NOW() - INTERVAL '18 days'
FROM public.courses c
WHERE c.title LIKE '%3D%' OR c.title LIKE '%Sketch%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 4: Sneha watching History of China (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000004',
    c.id,
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    600.00,
    500.00,
    500.00,
    100.00,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days' + INTERVAL '45 minutes',
    2700,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    95,
    'tx_pay_004',
    'tx_lock_004',
    NOW() - INTERVAL '14 days'
FROM public.courses c
WHERE c.title LIKE '%China%' OR c.title LIKE '%History%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 5: Vikram watching Web Development (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000005',
    c.id,
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    900.00,
    780.00,
    780.00,
    120.00,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days' + INTERVAL '65 minutes',
    3900,
    '{"stopped_at_lecture": 6, "completion_pct": 100}'::jsonb,
    TRUE,
    88,
    'tx_pay_005',
    'tx_lock_005',
    NOW() - INTERVAL '10 days'
FROM public.courses c
WHERE c.title LIKE '%Web Development%' OR c.title LIKE '%Full-Stack%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 6: Ananya watching Science course (IN PROGRESS - ACTIVE)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000006',
    c.id,
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    'active',
    650.00,
    0.00,
    0.00,
    0.00,
    NOW() - INTERVAL '30 minutes',
    NULL,
    1800,
    '{"stopped_at_lecture": 3, "completion_pct": 62}'::jsonb,
    FALSE,
    NULL,
    'tx_lock_006',
    NOW() - INTERVAL '30 minutes'
FROM public.courses c
WHERE c.title LIKE '%Science%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 7: Karthik watching Painting course (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000007',
    c.id,
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    400.00,
    350.00,
    350.00,
    50.00,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '28 minutes',
    1680,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    82,
    'tx_pay_007',
    'tx_lock_007',
    NOW() - INTERVAL '4 days'
FROM public.courses c
WHERE c.title LIKE '%Painting%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 8: Meera watching American Revolution (COMPLETED)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000008',
    c.id,
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    500.00,
    420.00,
    420.00,
    80.00,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '38 minutes',
    2280,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    90,
    'tx_pay_008',
    'tx_lock_008',
    NOW() - INTERVAL '2 days'
FROM public.courses c
WHERE c.title LIKE '%American%' OR c.title LIKE '%Revolution%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 9: Arjun watching MBBS course (LOCKED - Just Started)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken,
    lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000009',
    c.id,
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000002',
    'locked',
    450.00,
    0.00,
    0.00,
    0.00,
    NULL,
    NULL,
    0,
    '{"stopped_at_lecture": 0, "completion_pct": 0}'::jsonb,
    FALSE,
    'tx_lock_009',
    NOW() - INTERVAL '5 minutes'
FROM public.courses c
WHERE c.title LIKE '%MBBS%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Session 10: Divya watching Cooking (COMPLETED - Recent)
INSERT INTO public.sessions (
    id, course_id, student_id, teacher_id,
    status, locked_amount, final_cost, amount_paid, amount_refunded,
    start_time, end_time, duration_seconds,
    content_progress, assessment_taken, assessment_score,
    payment_tx_id, lock_tx_id,
    created_at
)
SELECT 
    'a0000000-0000-0000-0000-000000000010',
    c.id,
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'completed',
    750.00,
    680.00,
    680.00,
    70.00,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '52 minutes',
    3120,
    '{"stopped_at_lecture": 5, "completion_pct": 100}'::jsonb,
    TRUE,
    91,
    'tx_pay_010',
    'tx_lock_010',
    NOW() - INTERVAL '1 day'
FROM public.courses c
WHERE c.title LIKE '%Cooking%' OR c.title LIKE '%Recipe%'
LIMIT 1
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 5: REVIEWS (AI-Validated)
-- =====================================================

-- Review 1: Rahul's review of Cooking course
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'Excellent course! The traditional recipes were explained in detail. Chef''s tips really helped me understand the nuances of Indian cooking. Highly recommended for anyone wanting to learn authentic recipes.',
    '{"duration_sec": 1800, "completion_pct": 100, "assessment_score": 85, "interactions": 12}'::jsonb,
    0.92,
    TRUE,
    '{"watch_time_factor": 0.95, "completion_factor": 1.0, "assessment_factor": 0.85, "engagement_factor": 0.88}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '27 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT (id) DO NOTHING;

-- Review 2: Priya's review of Medical course
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'As a pre-med student, this course gave me incredible insights into the medical career path. The explanations about residency, specializations, and day-to-day life of doctors were invaluable. Must watch!',
    '{"duration_sec": 2100, "completion_pct": 100, "assessment_score": 92, "interactions": 18}'::jsonb,
    0.96,
    TRUE,
    '{"watch_time_factor": 0.98, "completion_factor": 1.0, "assessment_factor": 0.92, "engagement_factor": 0.94}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '23 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000002'
ON CONFLICT (id) DO NOTHING;

-- Review 3: Amit's review of 3D Sketching
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    4,
    'Good introduction to 3D sketching techniques. The pencil shading methods were clearly demonstrated. Would have liked more advanced techniques, but great for beginners.',
    '{"duration_sec": 1080, "completion_pct": 100, "assessment_score": 78, "interactions": 8}'::jsonb,
    0.82,
    TRUE,
    '{"watch_time_factor": 0.90, "completion_factor": 1.0, "assessment_factor": 0.78, "engagement_factor": 0.60}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '17 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000003'
ON CONFLICT (id) DO NOTHING;

-- Review 4: Sneha's review of History course
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'Fascinating journey through Chinese history! The connections drawn between different dynasties and their impact on modern China were brilliant. The visuals and storytelling kept me engaged throughout.',
    '{"duration_sec": 2700, "completion_pct": 100, "assessment_score": 95, "interactions": 22}'::jsonb,
    0.97,
    TRUE,
    '{"watch_time_factor": 0.96, "completion_factor": 1.0, "assessment_factor": 0.95, "engagement_factor": 0.97}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '13 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000004'
ON CONFLICT (id) DO NOTHING;

-- Review 5: Vikram's review of Web Development
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'Comprehensive bootcamp that covers everything from HTML to React! The project-based approach made learning practical. I built my first portfolio website during this course. Worth every minute!',
    '{"duration_sec": 3900, "completion_pct": 100, "assessment_score": 88, "interactions": 35}'::jsonb,
    0.94,
    TRUE,
    '{"watch_time_factor": 0.93, "completion_factor": 1.0, "assessment_factor": 0.88, "engagement_factor": 0.95}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '9 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000005'
ON CONFLICT (id) DO NOTHING;

-- Review 6: Karthik's review of Painting
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    4,
    'Very relaxing and informative painting tutorial. The color mixing techniques were especially helpful. Perfect for stress relief and learning a new skill at the same time.',
    '{"duration_sec": 1680, "completion_pct": 100, "assessment_score": 82, "interactions": 10}'::jsonb,
    0.85,
    TRUE,
    '{"watch_time_factor": 0.93, "completion_factor": 1.0, "assessment_factor": 0.82, "engagement_factor": 0.65}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '3 days'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000007'
ON CONFLICT (id) DO NOTHING;

-- Review 7: Meera's review of American Revolution
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'Eye-opening content about the American Revolution! The analysis of causes, key figures, and long-term impacts was thorough. Great for anyone interested in world history and its relevance today.',
    '{"duration_sec": 2280, "completion_pct": 100, "assessment_score": 90, "interactions": 15}'::jsonb,
    0.91,
    TRUE,
    '{"watch_time_factor": 0.91, "completion_factor": 1.0, "assessment_factor": 0.90, "engagement_factor": 0.83}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '1 day'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000008'
ON CONFLICT (id) DO NOTHING;

-- Review 8: Divya's review of Cooking
INSERT INTO public.reviews (
    id, session_id, student_id, teacher_id, course_id,
    rating, review_text,
    engagement_metrics, credibility_score, is_verified, credibility_factors,
    is_visible, moderation_status,
    created_at
)
SELECT 
    'b0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000010',
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    s.course_id,
    5,
    'Loved every minute of this cooking masterclass! The step-by-step instructions were easy to follow. My family couldn''t believe I made such delicious dishes. Already recommending to friends!',
    '{"duration_sec": 3120, "completion_pct": 100, "assessment_score": 91, "interactions": 28}'::jsonb,
    0.95,
    TRUE,
    '{"watch_time_factor": 0.95, "completion_factor": 1.0, "assessment_factor": 0.91, "engagement_factor": 0.94}'::jsonb,
    TRUE,
    'approved',
    NOW() - INTERVAL '12 hours'
FROM public.sessions s
WHERE s.id = 'a0000000-0000-0000-0000-000000000010'
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 6: PAYMENTS (Audit Trail)
-- =====================================================

-- Payment records for each completed session

-- Session 1 payments
INSERT INTO public.payments (id, session_id, payment_type, amount, from_user_id, to_user_id, gateway_tx_id, gateway_status, initiated_at, completed_at, is_final)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'lock', 500.00, '10000000-0000-0000-0000-000000000001', NULL, 'tx_lock_001', 'completed', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days', TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'charge', 375.00, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'tx_pay_001', 'completed', NOW() - INTERVAL '28 days' + INTERVAL '30 minutes', NOW() - INTERVAL '28 days' + INTERVAL '30 minutes', TRUE),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'refund', 125.00, NULL, '10000000-0000-0000-0000-000000000001', 'tx_refund_001', 'completed', NOW() - INTERVAL '28 days' + INTERVAL '31 minutes', NOW() - INTERVAL '28 days' + INTERVAL '31 minutes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Session 2 payments
INSERT INTO public.payments (id, session_id, payment_type, amount, from_user_id, to_user_id, gateway_tx_id, gateway_status, initiated_at, completed_at, is_final)
VALUES 
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'lock', 500.00, '10000000-0000-0000-0000-000000000002', NULL, 'tx_lock_002', 'completed', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days', TRUE),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'charge', 440.00, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'tx_pay_002', 'completed', NOW() - INTERVAL '24 days' + INTERVAL '35 minutes', NOW() - INTERVAL '24 days' + INTERVAL '35 minutes', TRUE),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'refund', 60.00, NULL, '10000000-0000-0000-0000-000000000002', 'tx_refund_002', 'completed', NOW() - INTERVAL '24 days' + INTERVAL '36 minutes', NOW() - INTERVAL '24 days' + INTERVAL '36 minutes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Session 5 payments (Web Development - higher amount)
INSERT INTO public.payments (id, session_id, payment_type, amount, from_user_id, to_user_id, gateway_tx_id, gateway_status, initiated_at, completed_at, is_final)
VALUES 
    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'lock', 900.00, '10000000-0000-0000-0000-000000000005', NULL, 'tx_lock_005', 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', TRUE),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'charge', 780.00, '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'tx_pay_005', 'completed', NOW() - INTERVAL '10 days' + INTERVAL '65 minutes', NOW() - INTERVAL '10 days' + INTERVAL '65 minutes', TRUE),
    ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'refund', 120.00, NULL, '10000000-0000-0000-0000-000000000005', 'tx_refund_005', 'completed', NOW() - INTERVAL '10 days' + INTERVAL '66 minutes', NOW() - INTERVAL '10 days' + INTERVAL '66 minutes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Session 10 payments (Recent)
INSERT INTO public.payments (id, session_id, payment_type, amount, from_user_id, to_user_id, gateway_tx_id, gateway_status, initiated_at, completed_at, is_final)
VALUES 
    ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'lock', 750.00, '10000000-0000-0000-0000-000000000010', NULL, 'tx_lock_010', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', TRUE),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000010', 'charge', 680.00, '10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'tx_pay_010', 'completed', NOW() - INTERVAL '1 day' + INTERVAL '52 minutes', NOW() - INTERVAL '1 day' + INTERVAL '52 minutes', TRUE),
    ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000010', 'refund', 70.00, NULL, '10000000-0000-0000-0000-000000000010', 'tx_refund_010', 'completed', NOW() - INTERVAL '1 day' + INTERVAL '53 minutes', NOW() - INTERVAL '1 day' + INTERVAL '53 minutes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Active session lock only
INSERT INTO public.payments (id, session_id, payment_type, amount, from_user_id, to_user_id, gateway_tx_id, gateway_status, initiated_at, is_final)
VALUES 
    ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', 'lock', 650.00, '10000000-0000-0000-0000-000000000006', NULL, 'tx_lock_006', 'completed', NOW() - INTERVAL '30 minutes', FALSE)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 7: QUALITY BONUSES
-- =====================================================

-- Quality bonus for high-rated sessions
INSERT INTO public.quality_bonuses (id, teacher_id, session_id, review_id, base_payment, bonus_percentage, bonus_amount, credibility_score, review_rating, paid_at, payment_tx_id)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 375.00, 12.00, 45.00, 0.92, 5, NOW() - INTERVAL '26 days', 'tx_bonus_001'),
    ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 440.00, 15.00, 66.00, 0.96, 5, NOW() - INTERVAL '22 days', 'tx_bonus_002'),
    ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 500.00, 15.00, 75.00, 0.97, 5, NOW() - INTERVAL '12 days', 'tx_bonus_003'),
    ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 780.00, 12.00, 93.60, 0.94, 5, NOW() - INTERVAL '8 days', 'tx_bonus_004'),
    ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000008', 680.00, 12.00, 81.60, 0.95, 5, NOW() - INTERVAL '10 hours', 'tx_bonus_005')
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- SECTION 8: UPDATE COURSE STATISTICS
-- =====================================================

-- Update course enrollments and ratings based on sessions
UPDATE public.courses c
SET 
    total_enrollments = (
        SELECT COUNT(DISTINCT student_id) 
        FROM public.sessions s 
        WHERE s.course_id = c.id AND s.status IN ('completed', 'active')
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM public.reviews r 
        WHERE r.course_id = c.id AND r.is_verified = TRUE
    ),
    average_rating = COALESCE(
        (SELECT AVG(rating)::DECIMAL(3,2) 
         FROM public.reviews r 
         WHERE r.course_id = c.id AND r.is_verified = TRUE),
        0
    ),
    updated_at = NOW();


-- =====================================================
-- SECTION 9: VERIFICATION QUERIES
-- =====================================================

-- Verify data counts
DO $$
DECLARE
    user_count INTEGER;
    teacher_count INTEGER;
    session_count INTEGER;
    review_count INTEGER;
    payment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO teacher_count FROM public.teachers;
    SELECT COUNT(*) INTO session_count FROM public.sessions;
    SELECT COUNT(*) INTO review_count FROM public.reviews;
    SELECT COUNT(*) INTO payment_count FROM public.payments;
    
    RAISE NOTICE '✅ Seed Data Summary:';
    RAISE NOTICE '   Users: %', user_count;
    RAISE NOTICE '   Teachers: %', teacher_count;
    RAISE NOTICE '   Sessions: %', session_count;
    RAISE NOTICE '   Reviews: %', review_count;
    RAISE NOTICE '   Payments: %', payment_count;
END $$;


-- =====================================================
-- END OF SEED DATA
-- =====================================================
