// @AI-IGNORE - Duplicate file. Use pages/HomePage.tsx instead.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ResumeCard from '../components/ResumeCard';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import CourseShortsPreview from '../components/CourseShortsPreview';
import ChatBot from '../components/ChatBot';
import LectureEarningsTable from '../components/LectureEarningsTable';
import StudentScoresTable from '../components/StudentScoresTable';
import PopularLecturesChart from '../components/PopularLecturesChart';
import { TrendingUp, Users, DollarSign, BookOpen, Calendar, BarChart } from 'lucide-react';
import type { Short } from '../components/CourseShortsPreview';

// Generate random teacher data for demonstration
const generateRandomTeacherData = () => {
  const totalEarnings = 12567.50 + Math.random() * 5000;
  const monthlyEarnings = 2340 + Math.random() * 1000;

  // Random lecture earnings
  const lectures = [
    { course_id: '1', course_title: 'Advanced React Patterns', category: 'Programming', num_lectures: 12, total_sessions: 23, total_students: 18, total_earnings: 2345 + Math.random() * 1000, avg_earnings_per_session: 102, price_per_minute: 2.5 },
    { course_id: '2', course_title: 'Machine Learning Fundamentals', category: 'AI/ML', num_lectures: 15, total_sessions: 31, total_students: 25, total_earnings: 3567 + Math.random() * 1000, avg_earnings_per_session: 115, price_per_minute: 3.0 },
    { course_id: '3', course_title: 'Web Development Bootcamp', category: 'Programming', num_lectures: 20, total_sessions: 45, total_students: 36, total_earnings: 4234 + Math.random() * 1500, avg_earnings_per_session: 94, price_per_minute: 2.0 },
    { course_id: '4', course_title: 'Data Science with Python', category: 'Data Science', num_lectures: 18, total_sessions: 28, total_students: 22, total_earnings: 2421 + Math.random() * 800, avg_earnings_per_session: 86, price_per_minute: 2.2 },
  ];

  // Random student scores
  const scores = [
    { session_id: '1', student_name: 'Alice Johnson', student_email: 'alice@example.com', course_title: 'Advanced React Patterns', assessment_score: 95, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3600 },
    { session_id: '2', student_name: 'Bob Smith', student_email: 'bob@example.com', course_title: 'Machine Learning Fundamentals', assessment_score: 88, discount_eligible: false, session_date: new Date().toISOString(), duration_seconds: 4200 },
    { session_id: '3', student_name: 'Carol White', student_email: 'carol@example.com', course_title: 'Web Development Bootcamp', assessment_score: 92, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3900 },
    { session_id: '4', student_name: 'David Lee', student_email: 'david@example.com', course_title: 'Data Science with Python', assessment_score: 78, discount_eligible: false, session_date: new Date().toISOString(), duration_seconds: 3300 },
    { session_id: '5', student_name: 'Emma Davis', student_email: 'emma@example.com', course_title: 'Advanced React Patterns', assessment_score: 96, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3750 },
  ];

  // Random popular lectures
  const popular = [
    { course_id: '3', course_title: 'Web Development Bootcamp', category: 'Programming', total_enrollments: 36, total_sessions: 45, completed_sessions: 42, completion_rate: 93.3, total_revenue: 4234, average_rating: 4.8, total_reviews: 28, is_active: true },
    { course_id: '2', course_title: 'Machine Learning Fundamentals', category: 'AI/ML', total_enrollments: 25, total_sessions: 31, completed_sessions: 29, completion_rate: 93.5, total_revenue: 3567, average_rating: 4.9, total_reviews: 22, is_active: true },
    { course_id: '4', course_title: 'Data Science with Python', category: 'Data Science', total_enrollments: 22, total_sessions: 28, completed_sessions: 25, completion_rate: 89.3, total_revenue: 2421, average_rating: 4.7, total_reviews: 18, is_active: true },
    { course_id: '1', course_title: 'Advanced React Patterns', category: 'Programming', total_enrollments: 18, total_sessions: 23, completed_sessions: 21, completion_rate: 91.3, total_revenue: 2345, average_rating: 4.6, total_reviews: 15, is_active: true },
  ];

  return {
    totalEarnings,
    monthlyEarnings,
    lectures,
    scores,
    popular,
    stats: {
      total_sessions: 127,
      total_students: 101,
      average_rating: 4.75,
      total_reviews: 83
    }
  };
};

// Student mock data (existing)
const mockResumeSession = {
  courseTitle: 'Advanced React Patterns & Hooks',
  instructorName: 'Sarah Chen',
  progressPercent: 65,
  currentTime: '12:34',
  totalTime: '45:20',
  estimatedCost: 3.45,
};

const mockRecommendedSessions = [
  { id: 1, title: 'Machine Learning Fundamentals', instructor: 'Dr. James Wilson', duration: 120, pricePerMinute: 0.05, rating: 4.8, reviewCount: 2340, badge: 'Highly-Rated' },
  { id: 2, title: 'Web Development Masterclass', instructor: 'Emma Rodriguez', duration: 90, pricePerMinute: 0.04, rating: 4.9, reviewCount: 3120, badge: 'Best-Seller' },
  { id: 3, title: 'Cloud Architecture Essentials', instructor: 'Michael Zhang', duration: 150, pricePerMinute: 0.06, rating: 4.7, reviewCount: 1890 },
  { id: 4, title: 'Data Science Deep Dive', instructor: 'Dr. Priya Sharma', duration: 180, pricePerMinute: 0.07, rating: 4.9, reviewCount: 2560, badge: 'Trending' },
  { id: 5, title: 'Product Management Bootcamp', instructor: 'Alex Patterson', duration: 100, pricePerMinute: 0.05, rating: 4.6, reviewCount: 1450 },
  { id: 6, title: 'UI/UX Design Principles', instructor: 'Lisa Johnson', duration: 75, pricePerMinute: 0.04, rating: 4.8, reviewCount: 2890 },
];

const mockCategories = [
  { id: 1, name: 'Artificial Intelligence', sessionCount: 342, icon: '🤖' },
  { id: 2, name: 'Data Science', sessionCount: 289, icon: '📊' },
  { id: 3, name: 'Fitness', sessionCount: 456, icon: '💪' },
  { id: 4, name: 'Music', sessionCount: 198, icon: '🎵' },
  { id: 5, name: 'Language Learning', sessionCount: 521, icon: '🗣️' },
  { id: 6, name: 'Meditation', sessionCount: 134, icon: '🧘' },
  { id: 7, name: 'Business', sessionCount: 412, icon: '💼' },
  { id: 8, name: 'Personal Development', sessionCount: 567, icon: '🌱' },
];

const mockInstructors = [
  { id: 1, name: 'Dr. James Wilson', title: 'AI Researcher', students: '45K+', logo: '🎓' },
  { id: 2, name: 'Sarah Chen', title: 'Full-stack Engineer', students: '32K+', logo: '💻' },
  { id: 3, name: 'Emma Rodriguez', title: 'Design Lead', students: '28K+', logo: '🎨' },
  { id: 4, name: 'Michael Zhang', title: 'Cloud Architect', students: '38K+', logo: '☁️' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(125.50);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [teacherData, setTeacherData] = useState<any>(null);

  // Determine if user is a teacher and set wallet balance accordingly
  useEffect(() => {
    if (user?.role === 'teacher') {
      const data = generateRandomTeacherData();
      setTeacherData(data);
      setWalletBalance(data.totalEarnings);
    }
  }, [user]);

  // Load course shorts metadata
  useEffect(() => {
    const loadShorts = async () => {
      try {
        const response = await fetch('/shorts/metadata.json');
        if (response.ok) {
          const data = await response.json();
          setShorts(Array.isArray(data) ? data : (data.shorts || []));
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

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/video-player?domain=${encodeURIComponent(categoryName)}`);
  };

  // TEACHER VIEW
  if (user?.role === 'teacher' && teacherData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar walletBalance={walletBalance} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-gray-400">Here's how your courses are performing</p>
            {teacherData.monthlyEarnings > 0 && (
              <p className="text-sm text-green-400 mt-1">
                +₹{teacherData.monthlyEarnings.toFixed(2)} earned this month
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total Students</h3>
              <p className="text-2xl font-bold text-white">{teacherData.stats.total_students}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total Sessions</h3>
              <p className="text-2xl font-bold text-white">{teacherData.stats.total_sessions}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total Earnings</h3>
              <p className="text-2xl font-bold text-white">₹{teacherData.totalEarnings.toFixed(2)}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Avg. Rating</h3>
              <p className="text-2xl font-bold text-white">{teacherData.stats.average_rating.toFixed(1)}</p>
            </div>
          </div>

          {/* Lecture Earnings */}
          <div className="mb-8">
            <LectureEarningsTable lectures={teacherData.lectures} isLoading={false} />
          </div>

          {/* Student Scores and Popular Lectures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <StudentScoresTable scores={teacherData.scores} isLoading={false} />
            <PopularLecturesChart lectures={teacherData.popular} isLoading={false} />
          </div>
        </div>

        <Footer />
        <ChatBot />
      </div>
    );
  }

  // STUDENT VIEW (existing)
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar walletBalance={walletBalance} />
      <Hero onFindSession={handleFindSession} onResumeSession={handleResumeSession} />

      {/* Resume Watching Section */}
      <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Continue Learning</h2>
          <p className="text-gray-400 mb-8">Pick up where you left off</p>
          <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
            <div className="flex gap-4">
              <ResumeCard {...mockResumeSession} />
            </div>
          </div>
        </div>
      </section>

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
              <CourseCard key={session.id} {...session} />
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
                onClick={() => handleCategoryClick(category.name)}
                className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1 border border-gray-600 hover:bg-gray-700 hover:border-emerald-400"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-white text-base mb-1 group-hover:text-emerald-400">
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
                <h3 className="font-semibold text-white text-lg mb-1">{instructor.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{instructor.title}</p>
                <div className="text-emerald-400 font-semibold text-sm">{instructor.students} students</div>
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
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">▶️</div>
              <h3 className="font-semibold text-lg mb-2">Start Learning</h3>
              <p className="text-white/80 text-sm">Find and join any session</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">⏱️</div>
              <h3 className="font-semibold text-lg mb-2">Timer Runs</h3>
              <p className="text-white/80 text-sm">Pay per minute you attend</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">⏸️</div>
              <h3 className="font-semibold text-lg mb-2">Stop Anytime</h3>
              <p className="text-white/80 text-sm">Leave whenever you want</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 text-2xl">✅</div>
              <h3 className="font-semibold text-lg mb-2">Instant Settlement</h3>
              <p className="text-white/80 text-sm">Deducted from your wallet</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to start learning?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of learners discovering their next skill</p>
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

      <Footer />
      <ChatBot />
    </div>
  );
};

export default HomePage;
