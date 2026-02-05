"""
YouTube API Integration - Fetch video metadata for course creation
This utility can fetch real video data when YouTube API key is configured
"""
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

# YouTube API configuration (add to .env when ready)
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", None)


def extract_video_id(url: str) -> str:
    """
    Extract video ID from YouTube URL
    Supports formats:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    """
    if "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    else:
        raise ValueError(f"Invalid YouTube URL: {url}")


def parse_iso8601_duration(duration: str) -> int:
    """
    Parse ISO 8601 duration (e.g., PT1H30M45S) to total minutes
    YouTube API returns duration in this format
    """
    import re
    
    hours = re.search(r'(\d+)H', duration)
    minutes = re.search(r'(\d+)M', duration)
    seconds = re.search(r'(\d+)S', duration)
    
    total_minutes = 0
    if hours:
        total_minutes += int(hours.group(1)) * 60
    if minutes:
        total_minutes += int(minutes.group(1))
    if seconds:
        total_minutes += int(seconds.group(1)) / 60
    
    return int(total_minutes)


def fetch_video_metadata(video_url: str) -> Optional[Dict[str, Any]]:
    """
    Fetch video metadata from YouTube Data API v3
    Requires YOUTUBE_API_KEY in environment variables
    
    Returns:
        {
            'title': str,
            'duration_minutes': int,
            'description': str,
            'chapters': List[Dict] (if available)
        }
    """
    if not YOUTUBE_API_KEY:
        print("⚠️  YouTube API key not configured. Using placeholder data.")
        return None
    
    try:
        import requests
        
        video_id = extract_video_id(video_url)
        
        # YouTube Data API endpoint
        api_url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "snippet,contentDetails",
            "id": video_id,
            "key": YOUTUBE_API_KEY
        }
        
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get("items"):
            print(f"❌ No video found for ID: {video_id}")
            return None
        
        video = data["items"][0]
        snippet = video["snippet"]
        content_details = video["contentDetails"]
        
        # Parse duration
        duration_minutes = parse_iso8601_duration(content_details["duration"])
        
        # Extract chapters from description (if video has chapters)
        chapters = extract_chapters_from_description(snippet["description"])
        
        return {
            "video_id": video_id,
            "title": snippet["title"],
            "description": snippet["description"],
            "duration_minutes": duration_minutes,
            "chapters": chapters
        }
    
    except Exception as e:
        print(f"❌ Error fetching YouTube data: {str(e)}")
        return None


def extract_chapters_from_description(description: str) -> List[Dict[str, Any]]:
    """
    Extract chapter timestamps from video description
    YouTube chapters format: "0:00 Chapter Title"
    """
    import re
    
    chapters = []
    
    # Regex to match timestamps (0:00, 1:30, 12:45)
    pattern = r'(\d{1,2}:\d{2})\s+(.+?)(?:\n|$)'
    matches = re.findall(pattern, description)
    
    for i, (timestamp, title) in enumerate(matches):
        # Convert timestamp to seconds
        parts = timestamp.split(":")
        seconds = int(parts[0]) * 60 + int(parts[1])
        
        chapters.append({
            "id": i + 1,
            "title": title.strip(),
            "video_timestamp_start": seconds
        })
    
    # Calculate duration for each chapter (end - start)
    for i in range(len(chapters)):
        if i < len(chapters) - 1:
            duration = chapters[i + 1]["video_timestamp_start"] - chapters[i]["video_timestamp_start"]
        else:
            # Last chapter duration is unknown without total video duration
            duration = 300  # Default 5 minutes
        
        chapters[i]["duration_minutes"] = duration / 60
    
    return chapters


def generate_mock_chapters(duration_minutes: int, category: str) -> List[Dict[str, Any]]:
    """
    Generate realistic chapter structure when video doesn't have chapters
    Divides video into logical segments based on category
    """
    # Determine number of chapters based on duration
    if duration_minutes < 15:
        num_chapters = 3
    elif duration_minutes < 30:
        num_chapters = 4
    elif duration_minutes < 60:
        num_chapters = 5
    else:
        num_chapters = 6
    
    # Chapter duration (roughly equal)
    chapter_duration = duration_minutes / num_chapters
    
    chapters = []
    current_timestamp = 0
    
    # Category-specific chapter naming
    chapter_templates = {
        "Cooking": ["Introduction", "Ingredients Preparation", "Main Cooking Process", "Plating & Presentation", "Tips & Variations"],
        "Medical": ["Introduction & Overview", "Theory & Concepts", "Practical Application", "Case Studies", "Summary & Key Points"],
        "Art": ["Introduction & Materials", "Basic Techniques", "Main Project", "Details & Refinement", "Final Touches"],
        "History": ["Historical Context", "Early Period", "Major Events", "Turning Points", "Legacy & Impact"],
        "Programming": ["Setup & Introduction", "Core Concepts", "Hands-on Examples", "Advanced Topics", "Project & Summary"],
        "Science": ["Introduction", "Fundamental Principles", "Experiments & Demonstrations", "Applications", "Review & Quiz"]
    }
    
    # Find matching template
    templates = chapter_templates.get("Programming", ["Part 1", "Part 2", "Part 3", "Part 4", "Part 5"])
    for key in chapter_templates:
        if key.lower() in category.lower():
            templates = chapter_templates[key]
            break
    
    for i in range(num_chapters):
        title = templates[i] if i < len(templates) else f"Part {i + 1}"
        
        chapters.append({
            "id": i + 1,
            "title": title,
            "duration_minutes": round(chapter_duration, 2),
            "video_timestamp_start": current_timestamp,
            "video_timestamp_end": current_timestamp + int(chapter_duration * 60)
        })
        
        current_timestamp += int(chapter_duration * 60)
    
    return chapters


# Example usage (commented out - for reference)
"""
if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    # Try fetching real data
    metadata = fetch_video_metadata(test_url)
    
    if metadata:
        print(f"Title: {metadata['title']}")
        print(f"Duration: {metadata['duration_minutes']} minutes")
        print(f"Chapters: {len(metadata.get('chapters', []))}")
    else:
        # Fallback to mock data
        print("Using mock data...")
        chapters = generate_mock_chapters(45, "Programming")
        print(f"Generated {len(chapters)} chapters")
"""
