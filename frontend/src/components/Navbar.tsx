import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  walletBalance: number;
}

const Navbar: React.FC<NavbarProps> = ({ walletBalance }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
            <div
              className="relative w-full"
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
                className="w-full h-11 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-5 pr-14 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5 text-white" />
              </button>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Trending on Murph
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
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
            </div>
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
          <div
            className="relative w-full"
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
              className="w-full h-10 rounded-full bg-white text-slate-900 placeholder-slate-500 pl-4 pr-12 border border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.18)]"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shadow-sm"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>

            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-3 bg-white text-slate-900 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.25)] border border-slate-200 p-4">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  Trending on Murph
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trendingTopics.map((topic) => (
                    <button
                      key={`mobile-${topic}`}
                      type="button"
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
