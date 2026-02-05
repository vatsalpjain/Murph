import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ResumeCard from '../components/ResumeCard';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import CourseShortsPreview from '../components/CourseShortsPreview';
import ChatBot from '../components/ChatBot';
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
    thumbnail: '/thumbnails/ml-fundamentals.svg',
    duration: 120,
    pricePerMinute: 0.05,
    rating: 4.8,
    reviewCount: 2340,
    badge: 'Highly-Rated',
    topic: 'machine learning',
    relatedVideos: 'Artificial Intelligence, Neural Networks, TensorFlow',
  },
  {
    id: 2,
    title: 'Web Development Masterclass',
    instructor: 'Emma Rodriguez',
    thumbnail: '/thumbnails/web-dev-masterclass.svg',
    duration: 90,
    pricePerMinute: 0.04,
    rating: 4.9,
    reviewCount: 3120,
    badge: 'Best-Seller',
    topic: 'web development',
    relatedVideos: 'React, JavaScript, Node.js, HTML/CSS',
  },
  {
    id: 3,
    title: 'Cloud Architecture Essentials',
    instructor: 'Michael Zhang',
    thumbnail: '/thumbnails/cloud-architecture.svg',
    duration: 150,
    pricePerMinute: 0.06,
    rating: 4.7,
    reviewCount: 1890,
    topic: 'cloud computing',
    relatedVideos: 'AWS, Azure, Google Cloud, DevOps',
  },
  {
    id: 4,
    title: 'Data Science Deep Dive',
    instructor: 'Dr. Priya Sharma',
    thumbnail: '/thumbnails/data-science.svg',
    duration: 180,
    pricePerMinute: 0.07,
    rating: 4.9,
    reviewCount: 2560,
    badge: 'Trending',
    topic: 'data science',
    relatedVideos: 'Python, Pandas, Numpy, Data Analysis',
  },
  {
    id: 5,
    title: 'Product Management Bootcamp',
    instructor: 'Alex Patterson',
    thumbnail: '/thumbnails/product-management.svg',
    duration: 100,
    pricePerMinute: 0.05,
    rating: 4.6,
    reviewCount: 1450,
    topic: 'product management',
    relatedVideos: 'Project Management, Leadership, Agile, Scrum',
  },
  {
    id: 6,
    title: 'UI/UX Design Principles',
    instructor: 'Lisa Johnson',
    thumbnail: '/thumbnails/ui-ux-design.svg',
    duration: 75,
    pricePerMinute: 0.04,
    rating: 4.8,
    reviewCount: 2890,
    topic: 'ui/ux design',
    relatedVideos: 'Figma, Adobe XD, Wireframing, Prototyping',
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
  const navigate = useNavigate();
  const [walletBalance] = useState<number>(125.50);
  const [shorts, setShorts] = useState<Short[]>([]);

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
          console.error('Failed to fetch shorts metadata:', response.status);
        }
      } catch (error) {
        console.error('Error loading shorts:', error);
      }
    };
    loadShorts();
  }, []);

  const handleFindSession = () => {
    navigate('/find-session');
  };

  const handleResumeSession = () => {
    alert('Resuming your session...');
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/video-player?domain=${encodeURIComponent(categoryName)}`);
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
                thumbnail={session.thumbnail}
                duration={session.duration}
                pricePerMinute={session.pricePerMinute}
                rating={session.rating}
                reviewCount={session.reviewCount}
                badge={session.badge}
                topic={session.topic}
                relatedVideos={session.relatedVideos}
                onViewPlaylist={() => navigate(`/video-player?q=${encodeURIComponent(session.topic)}`)}
              />
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

      {/* Floating Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default HomePage;
