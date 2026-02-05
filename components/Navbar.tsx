import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

interface NavbarProps {
  walletBalance: number;
}

const Navbar: React.FC<NavbarProps> = ({ walletBalance }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsSearchOpen(false);
    navigate(`/video-player?q=${encodeURIComponent(trimmed)}`);
  };

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

          {/* Search Bar - Center (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form
              className="relative w-full"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch(searchValue);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setIsSearchOpen(false);
                }
              }}
            >
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full h-11 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-5 pr-14 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5 text-white" />
              </button>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4 z-50">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Trending on Murph
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSearch(topic)}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm text-slate-700 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Recently viewed
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {recentlyViewed.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleSearch(course.title)}
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
            {/* Wallet Balance */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
              <div className="text-sm font-semibold text-white">
                ₹{walletBalance.toFixed(2)}
              </div>
            </div>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
            </button>

            {/* Profile */}
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </button>

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
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch(searchValue);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setIsSearchOpen(false);
              }
            }}
          >
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full h-10 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-4 pr-12 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>

            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4 z-50">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Trending on Murph
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trendingTopics.map((topic) => (
                    <button
                      key={`mobile-${topic}`}
                      type="button"
                      onClick={() => handleSearch(topic)}
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
                      onClick={() => handleSearch(course.title)}
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
