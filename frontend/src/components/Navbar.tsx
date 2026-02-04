import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  walletBalance: number;
}

const Navbar: React.FC<NavbarProps> = ({ walletBalance }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div
              className="text-2xl font-bold text-white tracking-wider cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => navigate('/')}
            >
              MURPH
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-800 text-white placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 sm:gap-2">
            {/* Watch Demo Button */}
            <button
              onClick={() => navigate('/video-player')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium hover:from-purple-400 hover:to-indigo-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              Watch Demo
            </button>

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
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Dashboard
                    </button>
                    <div className="border-t border-gray-700"></div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
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
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-800 text-white placeholder-gray-400 text-sm"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
