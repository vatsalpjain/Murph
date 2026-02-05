import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Wallet, Search, Play, Clock, Star, TrendingUp, Award, Users } from 'lucide-react';

// ==================== INTERFACES ====================
interface Short {
  id: string;
  title: string;
  courseTitle: string;
  instructor: string;
  videoPath: string;
  courseUrl: string;
  thumbnail?: string;
}

interface NavbarProps {
  walletBalance: number;
}

interface HeroProps {
  onFindSession: () => void;
  onResumeSession: () => void;
}

interface ResumeCardProps {
  courseTitle: string;
  instructorName: string;
  progressPercent: number;
  currentTime: string;
  totalTime: string;
  estimatedCost: number;
}

interface CourseCardProps {
  title: string;
  instructor: string;
  duration: number;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  badge?: string;
}

interface CourseShortsPreviewProps {
  shorts: Short[];
}

// ==================== NAVBAR COMPONENT ====================
const Navbar: React.FC<NavbarProps> = ({ walletBalance }) => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              MURPH
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Wallet & Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">${walletBalance.toFixed(2)}</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-emerald-500/50 transition-shadow">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// ==================== HERO COMPONENT ====================
const Hero: React.FC<HeroProps> = ({ onFindSession, onResumeSession }) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Learn from the Best,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Pay as You Learn
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Access world-class education with live sessions from top instructors. Pay only for the time you spend learning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onFindSession}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Find Your Next Session
            </button>
            <button
              onClick={onResumeSession}
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold border-2 border-gray-700 hover:border-emerald-500 transition-colors duration-200 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Resume Learning
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">10K+</div>
              <div className="text-gray-300">Active Learners</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">500+</div>
              <div className="text-gray-300">Expert Instructors</div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$0.03</div>
              <div className="text-gray-300">Avg. Cost Per Minute</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== RESUME CARD COMPONENT ====================
const ResumeCard: React.FC<ResumeCardProps> = ({
  courseTitle,
  instructorName,
  progressPercent,
  currentTime,
  totalTime,
  estimatedCost,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer group min-w-[300px] sm:min-w-[400px]">
      {/* Thumbnail with Play Overlay */}
      <div className="relative bg-gradient-to-br from-emerald-900 to-teal-900 h-48 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 relative z-10" />
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
          <div className="h-1 bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {courseTitle}
        </h3>
        <p className="text-gray-400 text-sm mb-4">{instructorName}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              {currentTime} / {totalTime}
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span>${estimatedCost.toFixed(2)}</span>
            <span className="text-gray-400 text-xs">to complete</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COURSE CARD COMPONENT ====================
const CourseCard: React.FC<CourseCardProps> = ({
  title,
  instructor,
  duration,
  pricePerMinute,
  rating,
  reviewCount,
  badge,
}) => {
  const totalPrice = (duration * pricePerMinute).toFixed(2);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 h-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>
        {badge && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            {badge}
          </div>
        )}
        <Play className="w-12 h-12 text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 relative z-10" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-3">{instructor}</p>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white font-semibold text-sm">{rating}</span>
          </div>
          <span className="text-gray-400 text-xs">({reviewCount.toLocaleString()})</span>
        </div>

        {/* Duration & Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center gap-1 text-gray-300 text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{duration} min</span>
          </div>
          <div className="text-emerald-400 font-bold text-lg">${totalPrice}</div>
        </div>
      </div>
    </div>
  );
};

// ==================== COURSE SHORTS PREVIEW COMPONENT ====================
const CourseShortsPreview: React.FC<CourseShortsPreviewProps> = ({ shorts }) => {
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  const handleMouseEnter = (shortId: string) => {
    const video = videoRefs.current[shortId];
    if (video) {
      video.play().catch(err => console.error('Error playing video:', err));
    }
  };

  const handleMouseLeave = (shortId: string) => {
    const video = videoRefs.current[shortId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const handleClick = (courseUrl: string) => {
    window.open(courseUrl, '_blank');
  };

  return (
    <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">Quick Course Previews</h2>
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-gray-400 mb-8">
          Hover to preview, click to explore full course
        </p>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {shorts.map((short) => (
              <div
                key={short.id}
                className="flex-shrink-0 w-[220px] group cursor-pointer"
                onMouseEnter={() => handleMouseEnter(short.id)}
                onMouseLeave={() => handleMouseLeave(short.id)}
                onClick={() => handleClick(short.courseUrl)}
              >
                {/* Video Container with 9:16 aspect ratio */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 group-hover:border-emerald-400 transition-all duration-300 aspect-[9/16] mb-3">
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[short.id] = el;
                    }}
                    src={short.videoPath}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    <Play className="w-12 h-12 text-white" />
                  </div>

                  {/* Gradient Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3">
                    <p className="text-white text-xs font-semibold line-clamp-2">
                      {short.title}
                    </p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="px-1">
                  <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {short.courseTitle}
                  </h4>
                  <p className="text-gray-400 text-xs line-clamp-1">{short.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

// ==================== FOOTER COMPONENT ====================
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              MURPH
            </span>
            <p className="text-gray-400 mt-4 text-sm">
              Learn from the best, pay as you learn. Access world-class education at your own pace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Browse Courses</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Find Instructors</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">How It Works</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Pricing</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Twitter</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">LinkedIn</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Instagram</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">YouTube</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© 2026 MURPH. All rights reserved. Built with 💚 for learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

// ==================== MOCK DATA ====================
const mockResumeSession = {
  courseTitle: 'Advanced React Patterns & Hooks',
  instructorName: 'Sarah Chen',
  progressPercent: 65,
  currentTime: '12:34',
  totalTime: '45:20',
  estimatedCost: 3.45,
};

const mockRecommendedSessions = [
  {
    id: 1,
    title: 'Machine Learning Fundamentals',
    instructor: 'Dr. James Wilson',
    duration: 120,
    pricePerMinute: 0.05,
    rating: 4.8,
    reviewCount: 2340,
    badge: 'Highly-Rated',
  },
  {
    id: 2,
    title: 'Web Development Masterclass',
    instructor: 'Emma Rodriguez',
    duration: 90,
    pricePerMinute: 0.04,
    rating: 4.9,
    reviewCount: 3120,
    badge: 'Best-Seller',
  },
  {
    id: 3,
    title: 'Cloud Architecture Essentials',
    instructor: 'Michael Zhang',
    duration: 150,
    pricePerMinute: 0.06,
    rating: 4.7,
    reviewCount: 1890,
  },
  {
    id: 4,
    title: 'Data Science Deep Dive',
    instructor: 'Dr. Priya Sharma',
    duration: 180,
    pricePerMinute: 0.07,
    rating: 4.9,
    reviewCount: 2560,
    badge: 'Trending',
  },
  {
    id: 5,
    title: 'Product Management Bootcamp',
    instructor: 'Alex Patterson',
    duration: 100,
    pricePerMinute: 0.05,
    rating: 4.6,
    reviewCount: 1450,
  },
  {
    id: 6,
    title: 'UI/UX Design Principles',
    instructor: 'Lisa Johnson',
    duration: 75,
    pricePerMinute: 0.04,
    rating: 4.8,
    reviewCount: 2890,
  },
];

// ==================== MAIN HOMEPAGE COMPONENT ====================
const HomePage: React.FC = () => {
  const [walletBalance] = useState<number>(125.50);
  const [chatOpen, setChatOpen] = useState(false);
  const [shorts, setShorts] = useState<Short[]>([]);

  // Load course shorts metadata
  useEffect(() => {
    const loadShorts = async () => {
      try {
        const response = await fetch('/shorts/metadata.json');
        if (response.ok) {
          const data = await response.json();
          setShorts(Array.isArray(data) ? data : (data.shorts || []));
          console.log('Loaded shorts:', data);
        } else {
          console.error('Failed to fetch shorts metadata:', response.status);
        }
      } catch (error) {
        console.error('Error loading shorts:', error);
      }
    };
    loadShorts();
  }, []);

  const handleFindSession = () => {
    alert('Redirecting to session discovery...');
  };

  const handleResumeSession = () => {
    alert('Resuming your session...');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar walletBalance={walletBalance} />

      {/* Hero Section */}
      <Hero onFindSession={handleFindSession} onResumeSession={handleResumeSession} />

      {/* Resume Watching Section */}
      <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Continue Learning</h2>
          <p className="text-gray-400 mb-8">Pick up where you left off</p>

          <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
            <div className="flex gap-4">
              <ResumeCard
                courseTitle={mockResumeSession.courseTitle}
                instructorName={mockResumeSession.instructorName}
                progressPercent={mockResumeSession.progressPercent}
                currentTime={mockResumeSession.currentTime}
                totalTime={mockResumeSession.totalTime}
                estimatedCost={mockResumeSession.estimatedCost}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Shorts Preview Section */}
      {shorts.length > 0 && <CourseShortsPreview shorts={shorts} />}

      {/* AI Recommended Sessions */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
            <span className="text-emerald-400">✨</span>
          </div>
          <p className="text-gray-400 mb-8">Handpicked sessions based on your interests</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRecommendedSessions.map((session) => (
              <CourseCard
                key={session.id}
                title={session.title}
                instructor={session.instructor}
                duration={session.duration}
                pricePerMinute={session.pricePerMinute}
                rating={session.rating}
                reviewCount={session.reviewCount}
                badge={session.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-emerald-500/50 transform hover:scale-110 transition-all duration-200 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default HomePage;
