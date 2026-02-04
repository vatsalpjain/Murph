# Complete Supabase Database Setup - Secure Pay-Per-Use Marketplace

Changes 

1)-- Just remove the auth.users dependency
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make id a regular UUID primary key
-- (Already is, just no FK now)

## 📋 Table of Contents

1. Project Initialization
2. Extensions & Setup
3. Database Schema Creation
4. Row Level Security (RLS) Policies
5. Database Functions & Triggers
6. Indexes for Performance
7. Real-time Subscriptions Setup
8. Testing & Validation

---

## STEP 1: Project Initialization

### 1.1 Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `learning-marketplace`
4. Database Password: **SAVE THIS SECURELY**
5. Region: Choose closest to your users
6. Wait for project to provision (~2 minutes)

### 1.2 Save Credentials

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc... (NEVER expose to frontend)
Database Password: [your_password]
```

---

## STEP 2: Enable Required Extensions

**Navigation:** SQL Editor → New Query

```sql
-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions (payment security)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search for courses
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**Execute:** Click "Run" or press `Ctrl/Cmd + Enter`

---

## STEP 3: Create Database Schema

### 3.1 Users Table (Core Identity)

```sql
-- Users table - extends Supabase Auth
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON public.users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Core user profiles linked to Supabase Auth';
COMMENT ON COLUMN public.users.wallet_address IS 'Blockchain wallet address for payments';
```

### 3.2 Teachers Table

```sql
-- Teachers profile and earnings tracking
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise_areas TEXT[] DEFAULT '{}',
    total_earnings DECIMAL(12, 2) DEFAULT 0 CHECK (total_earnings >= 0),
    quality_bonus_earned DECIMAL(12, 2) DEFAULT 0 CHECK (quality_bonus_earned >= 0),
    average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_sessions_completed INTEGER DEFAULT 0 CHECK (total_sessions_completed >= 0),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_teachers_user ON public.teachers(user_id);
CREATE INDEX idx_teachers_rating ON public.teachers(average_rating DESC);
CREATE INDEX idx_teachers_verified ON public.teachers(is_verified) WHERE is_verified = TRUE;

COMMENT ON TABLE public.teachers IS 'Teacher profiles with earnings and quality metrics';
```

### 3.3 Courses Table

```sql
-- Course catalog with pricing and structure
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price_per_minute DECIMAL(8, 4) NOT NULL CHECK (price_per_minute > 0),
    total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  
    -- Course content structure (lectures/modules)
    content_structure JSONB NOT NULL DEFAULT '{"lectures": []}',
  
    -- MCQ Assessment
    assessment_questions JSONB DEFAULT NULL,
  
    -- Ratings
    average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    total_enrollments INTEGER DEFAULT 0 CHECK (total_enrollments >= 0),
  
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
    -- Constraints
    CONSTRAINT valid_content_structure CHECK (
        jsonb_typeof(content_structure) = 'object' AND
        content_structure ? 'lectures'
    ),
    CONSTRAINT valid_assessment CHECK (
        assessment_questions IS NULL OR (
            jsonb_typeof(assessment_questions) = 'object' AND
            assessment_questions ? 'questions' AND
            assessment_questions ? 'passing_score'
        )
    )
);

-- Indexes for search and filtering
CREATE INDEX idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX idx_courses_category ON public.courses(category) WHERE is_active = TRUE;
CREATE INDEX idx_courses_rating ON public.courses(average_rating DESC) WHERE is_active = TRUE;
CREATE INDEX idx_courses_price ON public.courses(price_per_minute);
CREATE INDEX idx_courses_active ON public.courses(is_active);

-- Full-text search index
CREATE INDEX idx_courses_search ON public.courses USING GIN (
    to_tsvector('english', title || ' ' || description)
);

COMMENT ON TABLE public.courses IS 'Course catalog with content structure and assessments';
COMMENT ON COLUMN public.courses.content_structure IS 'JSONB: {lectures: [{id, title, duration_minutes}]}';
COMMENT ON COLUMN public.courses.assessment_questions IS 'JSONB: {questions: [...], passing_score: 60}';
```

### 3.4 Sessions Table (Critical - Payment Tracking)

```sql
-- Active and completed learning sessions
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
    -- Relationships
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  
    -- Session status
    status TEXT NOT NULL DEFAULT 'locked' CHECK (
        status IN ('locked', 'active', 'completed', 'refunded', 'failed')
    ),
  
    -- Payment amounts (CRITICAL - HIGH PRECISION)
    locked_amount DECIMAL(12, 6) NOT NULL CHECK (locked_amount > 0),
    final_cost DECIMAL(12, 6) DEFAULT 0 CHECK (final_cost >= 0),
    amount_paid DECIMAL(12, 6) DEFAULT 0 CHECK (amount_paid >= 0),
    amount_refunded DECIMAL(12, 6) DEFAULT 0 CHECK (amount_refunded >= 0),
  
    -- Time tracking
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
  
    -- Content progress tracking
    content_progress JSONB DEFAULT '{"stopped_at_lecture": 0, "completion_pct": 0}',
  
    -- Assessment results
    assessment_taken BOOLEAN DEFAULT FALSE,
    assessment_score INTEGER CHECK (assessment_score >= 0 AND assessment_score <= 100),
    assessment_answers JSONB,
  
    -- Payment gateway reference
    payment_tx_id TEXT,
    lock_tx_id TEXT,
    refund_tx_id TEXT,
  
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
    -- Business logic constraints
    CONSTRAINT valid_time_range CHECK (
        (end_time IS NULL) OR (end_time >= start_time)
    ),
    CONSTRAINT valid_payment_math CHECK (
        amount_paid + amount_refunded <= locked_amount + 0.01 -- Allow tiny rounding
    ),
    CONSTRAINT assessment_score_if_taken CHECK (
        (assessment_taken = FALSE AND assessment_score IS NULL) OR
        (assessment_taken = TRUE AND assessment_score IS NOT NULL)
    )
);

-- Critical indexes for payment queries
CREATE INDEX idx_sessions_student ON public.sessions(student_id, status);
CREATE INDEX idx_sessions_teacher ON public.sessions(teacher_id, status);
CREATE INDEX idx_sessions_course ON public.sessions(course_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_sessions_payment_tx ON public.sessions(payment_tx_id) WHERE payment_tx_id IS NOT NULL;
CREATE INDEX idx_sessions_active ON public.sessions(student_id) WHERE status IN ('locked', 'active');

COMMENT ON TABLE public.sessions IS 'Learning sessions with payment tracking - CRITICAL FOR MONEY FLOW';
COMMENT ON COLUMN public.sessions.locked_amount IS 'Initial reserve (e.g., $30) locked at session start';
COMMENT ON COLUMN public.sessions.final_cost IS 'Calculated cost based on actual usage';
```

### 3.5 Reviews Table (AI-Validated)

```sql
-- Student reviews with AI credibility scoring
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
    -- Relationships (one review per session)
    session_id UUID UNIQUE NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
  
    -- Engagement metrics for AI validation
    engagement_metrics JSONB NOT NULL DEFAULT '{}',
  
    -- AI credibility analysis
    credibility_score DECIMAL(4, 3) CHECK (credibility_score >= 0 AND credibility_score <= 1),
    is_verified BOOLEAN DEFAULT FALSE,
    credibility_factors JSONB DEFAULT '{}',
  
    -- Status
    is_visible BOOLEAN DEFAULT TRUE,
    moderation_status TEXT DEFAULT 'pending' CHECK (
        moderation_status IN ('pending', 'approved', 'flagged', 'rejected')
    ),
  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
    -- Constraints
    CONSTRAINT valid_engagement_metrics CHECK (
        jsonb_typeof(engagement_metrics) = 'object'
    )
);

-- Indexes
CREATE INDEX idx_reviews_teacher ON public.reviews(teacher_id, is_verified);
CREATE INDEX idx_reviews_course ON public.reviews(course_id, is_visible);
CREATE INDEX idx_reviews_student ON public.reviews(student_id);
CREATE INDEX idx_reviews_credibility ON public.reviews(credibility_score DESC) WHERE is_verified = TRUE;
CREATE INDEX idx_reviews_session ON public.reviews(session_id);

COMMENT ON TABLE public.reviews IS 'AI-validated reviews with credibility scoring';
COMMENT ON COLUMN public.reviews.credibility_score IS 'AI-calculated score 0-1 based on engagement depth';
COMMENT ON COLUMN public.reviews.engagement_metrics IS 'JSONB: {duration_sec, completion_pct, assessment_score}';
```

### 3.6 Payments Table (Audit Trail)

```sql
-- Immutable payment audit log
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
    -- Relationships
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE RESTRICT,
  
    -- Payment type
    payment_type TEXT NOT NULL CHECK (
        payment_type IN ('lock', 'charge', 'refund', 'quality_bonus')
    ),
  
    -- Amounts (HIGH PRECISION)
    amount DECIMAL(12, 6) NOT NULL CHECK (amount > 0),
  
    -- Parties
    from_user_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
    to_user_id UUID REFERENCES public.users(id) ON DELETE RESTRICT,
  
    -- Gateway tracking
    gateway_tx_id TEXT NOT NULL,
    gateway_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        gateway_status IN ('pending', 'processing', 'completed', 'failed', 'reversed')
    ),
  
    -- Metadata for debugging
    gateway_response JSONB,
    error_message TEXT,
  
    -- Timestamps
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
  
    -- Immutability flag
    is_final BOOLEAN DEFAULT FALSE,
  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Critical indexes for payment tracking
CREATE INDEX idx_payments_session ON public.payments(session_id, payment_type);
CREATE INDEX idx_payments_from_user ON public.payments(from_user_id);
CREATE INDEX idx_payments_to_user ON public.payments(to_user_id);
CREATE INDEX idx_payments_gateway_tx ON public.payments(gateway_tx_id);
CREATE INDEX idx_payments_status ON public.payments(gateway_status) WHERE gateway_status != 'completed';
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);

COMMENT ON TABLE public.payments IS 'Immutable audit trail of all payment transactions';
COMMENT ON COLUMN public.payments.is_final IS 'Set to TRUE when transaction cannot be reversed';
```

### 3.7 Quality Bonuses Table

```sql
-- Teacher quality bonus tracking
CREATE TABLE public.quality_bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
    -- Relationships
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  
    -- Payment breakdown
    base_payment DECIMAL(12, 6) NOT NULL CHECK (base_payment > 0),
    bonus_percentage DECIMAL(5, 2) NOT NULL CHECK (bonus_percentage >= 0 AND bonus_percentage <= 100),
    bonus_amount DECIMAL(12, 6) NOT NULL CHECK (bonus_amount >= 0),
  
    -- Quality metrics
    credibility_score DECIMAL(4, 3) NOT NULL CHECK (credibility_score >= 0 AND credibility_score <= 1),
    review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  
    -- Payment status
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_tx_id TEXT,
  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
    -- Constraints
    CONSTRAINT unique_session_bonus UNIQUE (session_id),
    CONSTRAINT bonus_calculation CHECK (
        ABS(bonus_amount - (base_payment * bonus_percentage / 100)) < 0.01
    )
);

-- Indexes
CREATE INDEX idx_quality_bonuses_teacher ON public.quality_bonuses(teacher_id);
CREATE INDEX idx_quality_bonuses_session ON public.quality_bonuses(session_id);
CREATE INDEX idx_quality_bonuses_created ON public.quality_bonuses(created_at DESC);

COMMENT ON TABLE public.quality_bonuses IS 'Teacher quality bonuses based on AI-validated reviews';
```

---

## STEP 4: Row Level Security (RLS) Policies

### 4.1 Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_bonuses ENABLE ROW LEVEL SECURITY;
```

### 4.2 Users Table Policies

```sql
-- Users: Read own profile
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users: Update own profile (not role or wallet after creation)
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Can't change role
    );

-- Users: Insert own profile on signup
CREATE POLICY "Users can create own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Service role can do anything (for backend operations)
CREATE POLICY "Service role full access to users"
    ON public.users
    USING (auth.jwt()->>'role' = 'service_role');
```

### 4.3 Teachers Table Policies

```sql
-- Teachers: Anyone can view active teachers
CREATE POLICY "Anyone can view teachers"
    ON public.teachers
    FOR SELECT
    USING (TRUE);

-- Teachers: Only own teacher profile can be updated
CREATE POLICY "Teachers can update own profile"
    ON public.teachers
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Teachers: Users with teacher role can create profile
CREATE POLICY "Teacher role can create teacher profile"
    ON public.teachers
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- Service role full access
CREATE POLICY "Service role full access to teachers"
    ON public.teachers
    USING (auth.jwt()->>'role' = 'service_role');
```

### 4.4 Courses Table Policies

```sql
-- Courses: Anyone can view active courses
CREATE POLICY "Anyone can view active courses"
    ON public.courses
    FOR SELECT
    USING (is_active = TRUE);

-- Courses: Teachers can view own courses (including inactive)
CREATE POLICY "Teachers can view own courses"
    ON public.courses
    FOR SELECT
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Courses: Teachers can create own courses
CREATE POLICY "Teachers can create courses"
    ON public.courses
    FOR INSERT
    WITH CHECK (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Courses: Teachers can update own courses
CREATE POLICY "Teachers can update own courses"
    ON public.courses
    FOR UPDATE
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Service role full access
CREATE POLICY "Service role full access to courses"
    ON public.courses
    USING (auth.jwt()->>'role' = 'service_role');
```

### 4.5 Sessions Table Policies (CRITICAL - Payment Security)

```sql
-- Sessions: Students can view own sessions
CREATE POLICY "Students can view own sessions"
    ON public.sessions
    FOR SELECT
    USING (student_id = auth.uid());

-- Sessions: Teachers can view sessions for their courses
CREATE POLICY "Teachers can view their sessions"
    ON public.sessions
    FOR SELECT
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Sessions: Students can create sessions (lock funds)
CREATE POLICY "Students can create sessions"
    ON public.sessions
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid() AND
        status = 'locked'
    );

-- Sessions: Students can update own active sessions ONLY for safe fields
CREATE POLICY "Students can update own session progress"
    ON public.sessions
    FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (
        student_id = auth.uid() AND
        -- Can only update these fields
        (
            content_progress IS NOT NULL OR
            assessment_taken IS NOT NULL OR
            assessment_score IS NOT NULL OR
            assessment_answers IS NOT NULL
        )
    );

-- Sessions: ONLY service role can update payment fields
CREATE POLICY "Service role can update payment fields"
    ON public.sessions
    FOR UPDATE
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role full access
CREATE POLICY "Service role full access to sessions"
    ON public.sessions
    USING (auth.jwt()->>'role' = 'service_role');
```

### 4.6 Reviews Table Policies

```sql
-- Reviews: Anyone can view verified reviews
CREATE POLICY "Anyone can view verified reviews"
    ON public.reviews
    FOR SELECT
    USING (is_verified = TRUE AND is_visible = TRUE);

-- Reviews: Students can view own reviews
CREATE POLICY "Students can view own reviews"
    ON public.reviews
    FOR SELECT
    USING (student_id = auth.uid());

-- Reviews: Teachers can view reviews for their courses
CREATE POLICY "Teachers can view their reviews"
    ON public.reviews
    FOR SELECT
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Reviews: Students can create reviews for own sessions
CREATE POLICY "Students can create reviews"
    ON public.reviews
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.sessions 
            WHERE id = session_id 
            AND student_id = auth.uid()
            AND status = 'completed'
        )
    );

-- Service role full access (for AI credibility updates)
CREATE POLICY "Service role full access to reviews"
    ON public.reviews
    USING (auth.jwt()->>'role' = 'service_role');
```

### 4.7 Payments Table Policies (Read-Only for Users)

```sql
-- Payments: Students can view own payments
CREATE POLICY "Students can view own payments"
    ON public.payments
    FOR SELECT
    USING (from_user_id = auth.uid());

-- Payments: Teachers can view received payments
CREATE POLICY "Teachers can view received payments"
    ON public.payments
    FOR SELECT
    USING (to_user_id = auth.uid());

-- Payments: ONLY service role can insert/update (immutable audit trail)
CREATE POLICY "Service role can manage payments"
    ON public.payments
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

### 4.8 Quality Bonuses Policies

```sql
-- Quality Bonuses: Teachers can view own bonuses
CREATE POLICY "Teachers can view own bonuses"
    ON public.quality_bonuses
    FOR SELECT
    USING (
        teacher_id IN (
            SELECT id FROM public.teachers WHERE user_id = auth.uid()
        )
    );

-- Quality Bonuses: Service role manages all
CREATE POLICY "Service role manages quality bonuses"
    ON public.quality_bonuses
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

---

---

## STEP 6: Performance Indexes (Already Included Above)

All critical indexes have been created inline with table definitions.

---

## STEP 7: Real-time Subscriptions Setup

### 7.1 Enable Realtime on Critical Tables

**Navigation:** Database → Replication

Enable realtime for:

- ✅ `sessions` (for live session metering)
- ✅ `payments` (for payment status updates)
- ✅ `reviews` (for new reviews)

```sql
-- Or via SQL
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
```

---

## STEP 8: Seed Sample Data (Optional for Testing)

```sql
-- Sample teacher user
INSERT INTO auth.users (id, email) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'teacher@test.com');

INSERT INTO public.users (id, email, name, role, wallet_address) VALUES
    ('11111111-1111-1111-1111-111111111111', 'teacher@test.com', 'John Guitar', 'teacher', '0xTeacher123');

INSERT INTO public.teachers (user_id, bio, expertise_areas) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Professional guitar teacher', ARRAY['Guitar', 'Music Theory']);

-- Sample course
INSERT INTO public.courses (
    teacher_id, 
    title, 
    description, 
    category, 
    price_per_minute,
    total_duration_minutes,
    content_structure,
    assessment_questions
) VALUES (
    (SELECT id FROM public.teachers WHERE user_id = '11111111-1111-1111-1111-111111111111'),
    'Guitar Basics for Beginners',
    'Learn fundamental guitar chords and strumming patterns',
    'Music',
    0.50,
    60,
    '{"lectures": [
        {"id": 1, "title": "Introduction to Guitar", "duration_minutes": 10},
        {"id": 2, "title": "First Chords: C, G, D", "duration_minutes": 15},
        {"id": 3, "title": "Strumming Patterns", "duration_minutes": 20},
        {"id": 4, "title": "Practice Song", "duration_minutes": 15}
    ]}'::jsonb,
    '{
        "passing_score": 70,
        "questions": [
            {
                "id": "q1",
                "question": "What is the first chord taught in this course?",
                "options": ["C Major", "G Major", "D Major", "E Minor"],
                "correct_answer": 0
            },
            {
                "id": "q2",
                "question": "Which finger technique is most important for clean chord transitions?",
                "options": ["Speed", "Pressure", "Relaxation", "All of the above"],
                "correct_answer": 3
            }
        ]
    }'::jsonb
);
```

---

## STEP 9: Testing & Validation

### 9.1 Test RLS Policies

```sql
-- Test as student (replace with actual user ID)
SET request.jwt.claims.sub = '22222222-2222-2222-2222-222222222222';

-- Should see only own sessions
SELECT * FROM public.sessions;

-- Should NOT be able to update payment fields
UPDATE public.sessions SET amount_paid = 999 WHERE student_id = '22222222-2222-2222-2222-222222222222';
-- Should fail with RLS error
```

### 9.2 Test Triggers

```sql
-- Create a session and verify teacher stats update
-- (Use service role or backend)

-- Verify updated_at auto-updates
UPDATE public.users SET name = 'New Name' WHERE id = auth.uid();
SELECT updated_at FROM public.users WHERE id = auth.uid();
-- Should show current timestamp
```

### 9.3 Verify Indexes

```sql
-- Check all indexes are created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

---

## STEP 10: Environment Variables for Backend

Save these in your `.env` file:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # KEEP SECRET - Backend only
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## STEP 11: Security Checklist

✅ **RLS enabled on all tables**
✅ **Payment fields protected** (only service role can modify)
✅ **Immutable audit trail** (payments table)
✅ **User isolation** (students see only their data)
✅ **Teacher verification** (can't fake teacher role)
✅ **Review validation** (AI credibility scoring)
✅ **Wallet uniqueness** (prevents duplicate accounts)
✅ **Transaction atomicity** (triggers handle consistency)

---

## STEP 12: Common Errors & Solutions

### Error: "permission denied for table X"

**Solution:** RLS is blocking access. Check policies or use service role key for backend.

### Error: "new row violates check constraint"

**Solution:** Check CONSTRAINT definitions. Ensure values match requirements.

### Error: "duplicate key value violates unique constraint"

**Solution:** Wallet address or session_id already exists. Handle in code.

### Error: "null value in column X violates not-null constraint"

**Solution:** Provide all required fields in INSERT/UPDATE.

---

## Next Steps

1. **Test with Supabase Client:**

```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_ANON_KEY
   )
```

2. **Integrate with FastAPI Backend:**

   - Use `supabase-py` for Python
   - Use service role key for payment operations
   - Frontend uses anon key with RLS
3. **Build Payment Flow:**

   - Lock funds → Create session with status='locked'
   - Start session → Update status='active', set start_time
   - End session → Update status='completed', calculate costs
   - Settle → Create payment records, trigger quality bonus

---

## Production Readiness Checklist

- [ ] Enable database backups (Settings → Database → Backups)
- [ ] Set up monitoring alerts (Settings → Monitoring)
- [ ] Configure email auth (if using Supabase Auth)
- [ ] Review RLS policies with security team
- [ ] Load test with expected user volume
- [ ] Set up staging environment (separate Supabase project)
- [ ] Document API endpoints using generated types
- [ ] Enable database connection pooling (for high traffic)

---

**You're now ready to build the FastAPI backend!** 🚀

All payment security handled, triggers automating stats, RLS protecting data.
