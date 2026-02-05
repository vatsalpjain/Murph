"""
AI-Powered YouTube Search Service
Uses Groq LLM to optimize search queries and rank YouTube results
"""
import os
import json
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Groq API endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_groq_llm(messages: List[Dict[str, str]], response_format: Optional[Dict] = None) -> str:
    """
    Call Groq LLM API with the given messages
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not configured in environment variables")
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",  # Using Llama 3.3 70B for best results
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024
    }
    
    if response_format:
        payload["response_format"] = response_format
    
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    
    return response.json()["choices"][0]["message"]["content"]


def optimize_search_query(user_query: str) -> Dict[str, Any]:
    """
    Use LLM to generate optimized YouTube search parameters
    """
    system_prompt = """You are a YouTube search query optimizer for an educational learning platform called Murph. 
Given a user's natural language query, generate optimized search parameters.

Return a JSON object with these fields:
- optimized_query: The best search query for YouTube (string)
- duration: Video duration filter - "any", "short" (under 4 min), "medium" (4-20 min), "long" (over 20 min)
- search_type: "educational", "tutorial", "lecture", "course", or "general"
- keywords: Array of relevant keywords for filtering results

Focus on educational content. If the query seems to be about learning a topic, optimize for tutorial/course content.
Always return valid JSON."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"User query: {user_query}"}
    ]
    
    try:
        response = call_groq_llm(messages, {"type": "json_object"})
        return json.loads(response)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "optimized_query": user_query,
            "duration": "any",
            "search_type": "educational",
            "keywords": []
        }
    except Exception as e:
        print(f"Error optimizing query: {e}")
        return {
            "optimized_query": user_query,
            "duration": "any",
            "search_type": "educational",
            "keywords": []
        }


def search_youtube(query: str, duration: str = "any", max_results: int = 8) -> List[Dict[str, Any]]:
    """
    Search YouTube using the Data API v3
    """
    if not YOUTUBE_API_KEY:
        print("⚠️ YouTube API key not configured")
        return []
    
    api_url = "https://www.googleapis.com/youtube/v3/search"
    
    # Map duration parameter
    duration_map = {
        "short": "short",
        "medium": "medium", 
        "long": "long",
        "any": None
    }
    
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "order": "relevance",
        "relevanceLanguage": "en",
        "safeSearch": "moderate",
        "key": YOUTUBE_API_KEY
    }
    
    # Add duration filter if specified
    video_duration = duration_map.get(duration)
    if video_duration:
        params["videoDuration"] = video_duration
    
    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        videos = []
        video_ids = []
        
        for item in data.get("items", []):
            video_id = item["id"]["videoId"]
            video_ids.append(video_id)
            
            snippet = item["snippet"]
            videos.append({
                "video_id": video_id,
                "title": snippet["title"],
                "description": snippet["description"][:200] if snippet["description"] else "",
                "channel": snippet["channelTitle"],
                "published_at": snippet["publishedAt"],
                "thumbnail": snippet["thumbnails"]["high"]["url"] if "high" in snippet["thumbnails"] else snippet["thumbnails"]["default"]["url"]
            })
        
        # Get video durations and view counts
        if video_ids:
            videos = enrich_video_data(videos, video_ids)
        
        return videos
        
    except Exception as e:
        print(f"❌ YouTube search error: {e}")
        return []


def enrich_video_data(videos: List[Dict], video_ids: List[str]) -> List[Dict]:
    """
    Enrich video data with duration and statistics
    """
    if not YOUTUBE_API_KEY or not video_ids:
        return videos
    
    api_url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "contentDetails,statistics",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY
    }
    
    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Create lookup dict
        video_details = {}
        for item in data.get("items", []):
            video_id = item["id"]
            duration = parse_duration(item["contentDetails"]["duration"])
            views = int(item["statistics"].get("viewCount", 0))
            video_details[video_id] = {
                "duration": duration,
                "duration_text": format_duration(duration),
                "views": views,
                "views_text": format_views(views)
            }
        
        # Enrich videos
        for video in videos:
            vid = video["video_id"]
            if vid in video_details:
                video.update(video_details[vid])
        
        return videos
        
    except Exception as e:
        print(f"Error enriching video data: {e}")
        return videos


def parse_duration(iso_duration: str) -> int:
    """Parse ISO 8601 duration to seconds"""
    import re
    
    hours = re.search(r'(\d+)H', iso_duration)
    minutes = re.search(r'(\d+)M', iso_duration)
    seconds = re.search(r'(\d+)S', iso_duration)
    
    total = 0
    if hours:
        total += int(hours.group(1)) * 3600
    if minutes:
        total += int(minutes.group(1)) * 60
    if seconds:
        total += int(seconds.group(1))
    
    return total


def format_duration(seconds: int) -> str:
    """Format seconds to human readable duration"""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins}:{secs:02d}"
    else:
        hours = seconds // 3600
        mins = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours}:{mins:02d}:{secs:02d}"


def format_views(views: int) -> str:
    """Format view count to human readable format"""
    if views >= 1_000_000:
        return f"{views / 1_000_000:.1f}M views"
    elif views >= 1_000:
        return f"{views / 1_000:.1f}K views"
    else:
        return f"{views} views"


def rank_videos_with_ai(videos: List[Dict], user_query: str, search_type: str) -> List[Dict]:
    """
    Use AI to re-rank videos based on relevance to user intent
    """
    if not videos or len(videos) <= 1:
        return videos
    
    # Prepare video context for LLM
    videos_context = json.dumps([{
        "index": i,
        "title": v["title"],
        "channel": v["channel"],
        "description": v.get("description", "")[:150]
    } for i, v in enumerate(videos)])
    
    system_prompt = f"""You are ranking YouTube videos for an educational platform.
The user is looking for {search_type} content.
Rank these videos by educational value and relevance to the query.

Return a JSON object with a "ranked_indices" array containing indices in order of relevance (best first).
Only return the JSON, nothing else."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Query: {user_query}\n\nVideos:\n{videos_context}"}
    ]
    
    try:
        response = call_groq_llm(messages, {"type": "json_object"})
        ranking = json.loads(response)
        
        indices = ranking.get("ranked_indices", list(range(len(videos))))
        
        # Validate indices
        valid_indices = [i for i in indices if isinstance(i, int) and 0 <= i < len(videos)]
        
        # Add any missing indices
        for i in range(len(videos)):
            if i not in valid_indices:
                valid_indices.append(i)
        
        return [videos[i] for i in valid_indices]
        
    except Exception as e:
        print(f"Error ranking videos: {e}")
        return videos


async def ai_youtube_search(user_query: str, max_results: int = 8) -> Dict[str, Any]:
    """
    Main AI-enhanced YouTube search function
    
    1. Uses LLM to optimize the search query
    2. Searches YouTube with optimized parameters
    3. Enriches results with duration/views
    4. Re-ranks results using AI for educational relevance
    """
    if not user_query or len(user_query.strip()) < 2:
        return {"videos": [], "optimized_query": "", "error": "Query too short"}
    
    # Check API keys
    if not GROQ_API_KEY:
        return {"videos": [], "optimized_query": user_query, "error": "AI service not configured"}
    
    if not YOUTUBE_API_KEY:
        return {"videos": [], "optimized_query": user_query, "error": "YouTube API not configured"}
    
    try:
        # Step 1: Optimize search query with AI
        search_params = optimize_search_query(user_query)
        optimized_query = search_params.get("optimized_query", user_query)
        duration = search_params.get("duration", "any")
        search_type = search_params.get("search_type", "educational")
        
        # Step 2: Search YouTube
        videos = search_youtube(optimized_query, duration, max_results)
        
        if not videos:
            # Try with original query if optimized query returns nothing
            videos = search_youtube(user_query, "any", max_results)
        
        # Step 3: Re-rank with AI (only if we have results)
        if videos and len(videos) > 2:
            videos = rank_videos_with_ai(videos, user_query, search_type)
        
        return {
            "videos": videos,
            "optimized_query": optimized_query,
            "search_type": search_type,
            "total": len(videos)
        }
        
    except Exception as e:
        print(f"❌ AI YouTube search error: {e}")
        # Fallback to basic YouTube search
        try:
            videos = search_youtube(user_query, "any", max_results)
            return {
                "videos": videos,
                "optimized_query": user_query,
                "search_type": "general",
                "total": len(videos),
                "fallback": True
            }
        except:
            return {"videos": [], "optimized_query": user_query, "error": str(e)}


# Quick search without AI ranking (faster for real-time suggestions)
async def quick_youtube_search(query: str, max_results: int = 5) -> List[Dict]:
    """
    Quick search without AI ranking - for real-time search suggestions
    """
    if not query or len(query.strip()) < 2:
        return []
    
    if not YOUTUBE_API_KEY:
        return []
    
    return search_youtube(query, "any", max_results)
