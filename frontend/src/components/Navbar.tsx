import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Search, LogOut, LayoutDashboard, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// YouTube video result type
interface YouTubeVideo {
  video_id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration_text?: string;
  views_text?: string;
}

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Debounced YouTube search
  const searchYouTube = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setYoutubeResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/search/youtube?q=${encodeURIComponent(query.trim())}&max_results=6`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setYoutubeResults(data.videos || []);
      
      if (data.error) {
        setSearchError(data.error);
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      setYoutubeResults([]);
      setSearchError('Search unavailable');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search (wait 400ms after user stops typing)
    searchTimeoutRef.current = setTimeout(() => {
      searchYouTube(value);
    }, 400);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle YouTube video click
  const handleVideoClick = (video: YouTubeVideo) => {
    const params = new URLSearchParams({
      v: video.video_id,
      title: video.title,
      channel: video.channel
    });
    navigate(`/video-player?${params.toString()}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setYoutubeResults([]);
  };

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/video-player?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setYoutubeResults([]);
    }
  };

  // Handle trending topic click
  const handleTopicClick = (topic: string) => {
    navigate(`/video-player?q=${encodeURIComponent(topic)}`);
    setIsSearchOpen(false);
  };

  // Handle recently viewed click
  const handleRecentClick = (courseTitle: string) => {
    navigate(`/video-player?q=${encodeURIComponent(courseTitle)}`);
    setIsSearchOpen(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleDashboard = () => {
    setIsProfileMenuOpen(false);
    if (user?.role === 'teacher') {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/');
  };

  // Get user's first letter for avatar
  const getUserInitial = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const trendingTopics = [
    'artificial intelligence',
    'python',
    'microsoft excel',
    'excel',
    'ai',
    'machine learning',
    'project management',
    'data analytics',
    'cybersecurity',
    'power bi',
    'digital marketing',
    'sql',
  ];

  const recentlyViewed = [
    {
      id: 'python-ai',
      title: 'Python for Data Science, AI & Development',
      provider: 'IBM',
    },
    {
      id: 'power-bi',
      title: 'Microsoft Power BI Data Analyst',
      provider: 'Microsoft',
    },
    {
      id: 'google-analytics',
      title: 'Google Data Analytics',
      provider: 'Google',
    },
    {
      id: 'ml-essentials',
      title: 'AI & Machine Learning Essentials with Python',
      provider: 'University of Pennsylvania',
    },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-white tracking-wider">
              MURPH
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form
              className="relative w-full"
              onSubmit={handleSearch}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setTimeout(() => setIsSearchOpen(false), 200);
                }
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="What do you want to learn?"
                className="w-full h-11 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-5 pr-14 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
                aria-label="Search"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Search className="w-4.5 h-4.5 text-white" />
                )}
              </button>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4 max-h-[80vh] overflow-y-auto">
                  
                  {/* YouTube Video Results - Show when searching */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-red-500" />
                        AI-Powered Video Suggestions
                        {isSearching && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </div>
                      
                      {searchError && !youtubeResults.length && (
                        <div className="text-sm text-slate-500 py-2">{searchError}</div>
                      )}
                      
                      {youtubeResults.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {youtubeResults.map((video) => (
                            <button
                              key={video.video_id}
                              type="button"
                              onClick={() => handleVideoClick(video)}
                              className="text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all overflow-hidden group"
                            >
                              <div className="relative">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full aspect-video object-cover"
                                />
                                {video.duration_text && (
                                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {video.duration_text}
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5">
                                <div className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                                  {video.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                  <span className="truncate">{video.channel}</span>
                                  {video.views_text && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span>{video.views_text}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {!isSearching && !searchError && youtubeResults.length === 0 && searchQuery.trim().length >= 2 && (
                        <div className="text-sm text-slate-500 py-2">No videos found. Try a different search.</div>
                      )}
                      
                      {youtubeResults.length > 0 && (
                        <div className="border-b border-slate-200 my-4"></div>
                      )}
                    </div>
                  )}
                  
                  {/* Trending Topics - Always visible */}
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Trending on Murph
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicClick(topic)}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  
                  {/* Recently Viewed - Always visible */}
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Recently viewed
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {recentlyViewed.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleRecentClick(course.title)}
                        className="text-left p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-xs text-slate-500 mb-1">{course.provider}</div>
                        <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                          {course.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 sm:gap-2">
            {/* Notifications */}
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {getUserInitial()}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <p className="text-xs text-emerald-600 mt-1 capitalize">{user?.role}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleDashboard}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form
            className="relative w-full"
            onSubmit={handleSearch}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setTimeout(() => setIsSearchOpen(false), 200);
              }
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="What do you want to learn?"
              className="w-full h-10 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-4 pr-12 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
              aria-label="Search"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-white" />
              )}
            </button>

            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4 max-h-[70vh] overflow-y-auto">
                
                {/* YouTube Video Results - Mobile */}
                {searchQuery.trim().length >= 2 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 text-red-500" />
                      AI-Powered Suggestions
                      {isSearching && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                    </div>
                    
                    {youtubeResults.length > 0 && (
                      <div className="grid grid-cols-1 gap-3">
                        {youtubeResults.slice(0, 4).map((video) => (
                          <button
                            key={`mobile-yt-${video.video_id}`}
                            type="button"
                            onClick={() => handleVideoClick(video)}
                            className="text-left rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all overflow-hidden flex gap-3"
                          >
                            <div className="relative w-28 flex-shrink-0">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full aspect-video object-cover"
                              />
                              {video.duration_text && (
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
                                  {video.duration_text}
                                </div>
                              )}
                            </div>
                            <div className="py-2 pr-2 flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
                                {video.title}
                              </div>
                              <div className="text-xs text-slate-500 mt-1 truncate">
                                {video.channel}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {youtubeResults.length > 0 && (
                      <div className="border-b border-slate-200 my-4"></div>
                    )}
                  </div>
                )}
                
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Trending on Murph
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trendingTopics.map((topic) => (
                    <button
                      key={`mobile-${topic}`}
                      type="button"
                      onClick={() => handleTopicClick(topic)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Recently viewed
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {recentlyViewed.map((course) => (
                    <button
                      key={`mobile-${course.id}`}
                      type="button"
                      onClick={() => handleRecentClick(course.title)}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-xs text-slate-500 mb-1">{course.provider}</div>
                      <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                        {course.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
