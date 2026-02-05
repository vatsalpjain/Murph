"""
Seed Courses Data Generator
Creates SQL INSERT statements for 10 educational YouTube courses
Run this to generate seed_courses.sql file
"""
import json
from typing import List, Dict, Any
from youtube_api import generate_mock_chapters, extract_video_id


# Course data provided by user
COURSES_DATA = [
    {
        "url": "https://www.youtube.com/watch?v=-JqRrwgcq5Q",
        "category": "Cooking & Home Management",
        "total_price": 350,
        "estimated_duration": 25,  # minutes
        "title": "Essential Home Cooking Techniques"
    },
    {
        "url": "https://www.youtube.com/watch?v=Lw-kuSmPrTA",
        "category": "Cooking (Family Recipes)",
        "total_price": 750,
        "estimated_duration": 55,
        "title": "Traditional Family Recipes Masterclass"
    },
    {
        "url": "https://www.youtube.com/watch?v=15-Q4ij3oUQ",
        "category": "Medical Career & Doctor Training",
        "total_price": 550,
        "estimated_duration": 40,
        "title": "Medical Career Pathways & Training Guide"
    },
    {
        "url": "https://www.youtube.com/watch?v=VmYSKcPyHyw",
        "category": "Medical Education (MBBS)",
        "total_price": 450,
        "estimated_duration": 35,
        "title": "MBBS Fundamentals & Study Strategies"
    },
    {
        "url": "https://www.youtube.com/watch?v=1NZh9k67edc",
        "category": "Art & Drawing (3D Pencil Sketch)",
        "total_price": 300,
        "estimated_duration": 20,
        "title": "3D Pencil Sketching Techniques"
    },
    {
        "url": "https://www.youtube.com/watch?v=JKpi3HMq6Nw",
        "category": "Art & Painting Tutorial",
        "total_price": 400,
        "estimated_duration": 30,
        "title": "Complete Painting Tutorial for Beginners"
    },
    {
        "url": "https://www.youtube.com/watch?v=4e8pJI8RMn0",
        "category": "History (China 1500-2026)",
        "total_price": 600,
        "estimated_duration": 50,
        "title": "History of China: 1500-2026"
    },
    {
        "url": "https://www.youtube.com/watch?v=zYqv7EOHb8s",
        "category": "History (American Revolution)",
        "total_price": 500,
        "estimated_duration": 42,
        "title": "The American Revolution Explained"
    },
    {
        "url": "https://www.youtube.com/watch?v=U-L7ZkROK2Q",
        "category": "Software Development & Programming",
        "total_price": 900,
        "estimated_duration": 70,
        "title": "Full-Stack Web Development Bootcamp"
    },
    {
        "url": "https://www.youtube.com/watch?v=a5C3CudLF4w",
        "category": "Science (Physics, Chemistry & Biology)",
        "total_price": 650,
        "estimated_duration": 48,
        "title": "Complete Science Foundation Course"
    }
]


def calculate_price_per_minute(total_price: float, duration_minutes: int) -> float:
    """Calculate price per minute from total price"""
    return round(total_price / duration_minutes, 4)


def generate_course_sql(course_data: Dict[str, Any], teacher_id: str) -> str:
    """
    Generate SQL INSERT statement for a single course
    """
    video_id = extract_video_id(course_data["url"])
    price_per_minute = calculate_price_per_minute(
        course_data["total_price"],
        course_data["estimated_duration"]
    )
    
    # Generate chapter structure
    chapters = generate_mock_chapters(
        course_data["estimated_duration"],
        course_data["category"]
    )
    
    # Build content_structure JSONB
    content_structure = {
        "lectures": chapters,
        "video_id": video_id,
        "video_url": course_data["url"]
    }
    
    # Build description
    description = f"Learn {course_data['title'].lower()} in this comprehensive {course_data['estimated_duration']}-minute course. " \
                  f"Covers {len(chapters)} key topics with hands-on examples and practical exercises."
    
    # Escape single quotes in strings for SQL
    title_escaped = course_data["title"].replace("'", "''")
    description_escaped = description.replace("'", "''")
    category_escaped = course_data["category"].replace("'", "''")
    content_json_escaped = json.dumps(content_structure).replace("'", "''")
    
    sql = f"""
INSERT INTO public.courses (
    teacher_id,
    title,
    description,
    category,
    price_per_minute,
    total_duration_minutes,
    content_structure,
    is_active
) VALUES (
    '{teacher_id}',
    '{title_escaped}',
    '{description_escaped}',
    '{category_escaped}',
    {price_per_minute},
    {course_data["estimated_duration"]},
    '{content_json_escaped}'::jsonb,
    TRUE
);
"""
    return sql


def generate_teacher_sql() -> tuple[str, str]:
    """
    Generate SQL to create a test teacher account
    Returns: (teacher_insert_sql, teacher_id)
    
    Note: We use fixed UUIDs for both user and teacher to ensure consistency
    """
    # Use fixed UUIDs for test data
    teacher_user_id = "00000000-0000-0000-0000-000000000001"
    teacher_id = "00000000-0000-0000-0000-000000000002"  # This is what courses will reference
    
    user_sql = f"""
-- Create test teacher user account
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    is_active
) VALUES (
    '{teacher_user_id}',
    'teacher@murph.test',
    'Demo Teacher',
    'teacher',
    TRUE
) ON CONFLICT (id) DO NOTHING;
"""
    
    teacher_sql = f"""
-- Create teacher profile (with fixed id for course references)
INSERT INTO public.teachers (
    id,
    user_id,
    bio,
    expertise_areas,
    is_verified
) VALUES (
    '{teacher_id}',
    '{teacher_user_id}',
    'Experienced educator with expertise across multiple domains including technology, arts, science, and humanities.',
    ARRAY['Programming', 'Art', 'Science', 'History', 'Medical Education', 'Cooking'],
    TRUE
) ON CONFLICT (id) DO NOTHING;
"""
    
    return (user_sql + teacher_sql, teacher_id)


def generate_all_sql():
    """
    Generate complete SQL file with all seed data
    """
    print("🚀 Generating seed data SQL...")
    
    # Generate teacher account
    teacher_sql, teacher_id = generate_teacher_sql()
    
    # Header
    sql_content = """-- =====================================================
-- Murph Learning Platform - Course Seed Data
-- Generated: 2026-02-05
-- Purpose: Populate courses table with 10 YouTube courses
-- =====================================================

-- Delete existing test data (optional - uncomment if needed)
-- DELETE FROM public.sessions WHERE teacher_id = '00000000-0000-0000-0000-000000000002';
-- DELETE FROM public.courses WHERE teacher_id = '00000000-0000-0000-0000-000000000002';
-- DELETE FROM public.teachers WHERE id = '00000000-0000-0000-0000-000000000002';
-- DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001';

"""
    
    sql_content += teacher_sql
    sql_content += "\n\n-- =====================================================\n"
    sql_content += "-- COURSES DATA\n"
    sql_content += "-- =====================================================\n\n"
    
    # Generate SQL for each course
    for i, course in enumerate(COURSES_DATA, 1):
        print(f"  Processing course {i}/10: {course['title']}")
        course_sql = generate_course_sql(course, teacher_id)
        sql_content += f"-- Course {i}: {course['title']}\n"
        sql_content += course_sql
        sql_content += "\n"
    
    # Write to file
    output_file = "seed_courses.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(sql_content)
    
    print(f"\n✅ SQL file generated: {output_file}")
    print(f"\n📊 Summary:")
    print(f"   - 1 test teacher account")
    print(f"   - 10 courses across 6 categories")
    print(f"   - Total estimated duration: {sum(c['estimated_duration'] for c in COURSES_DATA)} minutes")
    print(f"\n📝 Next steps:")
    print(f"   1. Open Supabase SQL Editor")
    print(f"   2. Copy contents of {output_file}")
    print(f"   3. Run the SQL query")
    print(f"   4. Verify data in 'courses' table")


if __name__ == "__main__":
    generate_all_sql()
