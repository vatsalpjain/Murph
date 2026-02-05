-- =====================================================
-- Migration: Add Video Metrics Tracking to Sessions
-- Date: 2026-02-05
-- Purpose: Add fields for real-time video metrics tracking
-- =====================================================

-- Add new columns to sessions table for video metrics
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS completion_pct DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_progress JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the new fields
COMMENT ON COLUMN public.sessions.completion_pct IS 'Video completion percentage (0-100)';
COMMENT ON COLUMN public.sessions.content_progress IS 'Lecture-level progress tracking: {"lecture_1": {"completed": true, "last_watched": "2026-02-05T..."}}';

-- Create index on completion_pct for analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_completion_pct ON public.sessions(completion_pct);

-- =====================================================
-- PostgreSQL Function: Increment Teacher Earnings
-- Purpose: Atomically update teacher total_earnings
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_earnings(
    teacher_row_id UUID,
    amount DECIMAL(10,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.teachers
    SET total_earnings = COALESCE(total_earnings, 0) + amount
    WHERE id = teacher_row_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_earnings TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION public.increment_earnings IS 'Atomically increments teacher total_earnings by specified amount';

-- =====================================================
-- Validation Queries
-- =====================================================

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sessions' 
    AND column_name IN ('completion_pct', 'content_progress')
ORDER BY column_name;

-- Verify function was created
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'increment_earnings';
