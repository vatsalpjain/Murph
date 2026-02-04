import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ResumeCard from '../components/ResumeCard';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import CourseShortsPreview from '../components/CourseShortsPreview';
import type { Short } from '../components/CourseShortsPreview';

// Mock Data
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

const mockCategories = [
  {
    id: 1,
    name: 'Artificial Intelligence',
    sessionCount: 342,
    icon: '🤖',
  },
  {
    id: 2,
    name: 'Data Science',
    sessionCount: 289,
    icon: '📊',
  },
  {
    id: 3,
    name: 'Fitness',
    sessionCount: 456,
    icon: '💪',
  },
  {
    id: 4,
    name: 'Music',
    sessionCount: 198,
    icon: '🎵',
  },
  {
    id: 5,
    name: 'Language Learning',
    sessionCount: 521,
    icon: '🗣️',
  },
  {
    id: 6,
    name: 'Meditation',
    sessionCount: 134,
    icon: '🧘',
  },
  {
    id: 7,
    name: 'Business',
    sessionCount: 412,
    icon: '💼',
  },
  {
    id: 8,
    name: 'Personal Development',
    sessionCount: 567,
    icon: '🌱',
  },
];

const mockInstructors = [
  {
    id: 1,
    name: 'Dr. James Wilson',
    title: 'AI Researcher',
    students: '45K+',
    logo: '🎓',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    title: 'Full-stack Engineer',
    students: '32K+',
    logo: '💻',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    title: 'Design Lead',
    students: '28K+',
    logo: '🎨',
  },
  {
    id: 4,
    name: 'Michael Zhang',
    title: 'Cloud Architect',
    students: '38K+',
    logo: '☁️',
  },
];

const HomePage: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<number>(100); // Default ₹100
  const [chatOpen, setChatOpen] = useState(false);
  const [shorts, setShorts] = useState<Short[]>([]);

  // Fetch wallet balance from API
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/wallet/balance-public');
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        // Keep default ₹100 for new users
      }
    };
    fetchBalance();
  }, []);

  // Load course shorts metadata
  useEffect(() => {
    const loadShorts = async () => {
      try {
        // Fetch from the Murph backend shorts metadata
        const response = await fetch('/shorts/metadata.json');
        if (response.ok) {
          const data = await response.json();
          // Data is already an array
          setShorts(Array.isArray(data) ? data : (data.shorts || []));
          console.log('Loaded shorts:', data);
        } else {
          // File not found, use empty array
          console.log('No shorts metadata found, using empty array');
          setShorts([]);
        }
      } catch (error) {
        // Silently handle error and use empty array
        console.log('No shorts available');
        setShorts([]);
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

      {/* Explore by Domain */}
      <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Explore by Domain</h2>
          <p className="text-gray-400 mb-8">Find sessions in any category</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1 border border-gray-600"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-white text-base mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400">{category.sessionCount} sessions</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Instructors */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Learn from World-Class Instructors</h2>
          <p className="text-gray-400 mb-8">Expert educators trusted by thousands</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockInstructors.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 text-center"
              >
                <div className="text-5xl mb-4">{instructor.logo}</div>
                <h3 className="font-semibold text-white text-lg mb-1">
                  {instructor.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{instructor.title}</p>
                <div className="text-emerald-400 font-semibold text-sm">
                  {instructor.students} students
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pay-Per-Use Explainer */}
      <section className="bg-gradient-to-r from-teal-900 to-cyan-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Murph Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">
                ▶️
              </div>
              <h3 className="font-semibold text-lg mb-2">Start Learning</h3>
              <p className="text-white/80 text-sm">Find and join any session</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">
                ⏱️
              </div>
              <h3 className="font-semibold text-lg mb-2">Timer Runs</h3>
              <p className="text-white/80 text-sm">Pay per minute you attend</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">
                ⏸️
              </div>
              <h3 className="font-semibold text-lg mb-2">Stop Anytime</h3>
              <p className="text-white/80 text-sm">Leave whenever you want</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">
                ✅
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Settlement</h3>
              <p className="text-white/80 text-sm">Deducted from your wallet</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start learning?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of learners discovering their next skill
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
              Explore Sessions
            </button>
            <button className="px-8 py-3 border-2 border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 flex items-center justify-center hover:scale-110 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute bottom-full right-0 mb-3 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
            Ask Murph AI
          </span>
        </button>

        {/* Chat Modal (Placeholder) */}
        {chatOpen && (
          <div className="absolute bottom-20 right-0 w-80 h-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold">Murph AI Assistant</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-xl hover:opacity-80"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-200 bg-gray-700 rounded-lg p-3 inline-block">
                  Hi! 👋 I'm Murph AI. How can I help you find the perfect session?
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <input
                type="text"
                placeholder="Ask something..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
