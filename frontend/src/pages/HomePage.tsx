import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ResumeCard from '../components/ResumeCard';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import CourseShortsPreview from '../components/CourseShortsPreview';
import ChatBot from '../components/ChatBot';
import { apiClient } from '../utils/api';
import type { Short } from '../components/CourseShortsPreview';

// Interface for courses from database
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_minute: number;
  total_duration_minutes: number;
  video_id: string;
  video_url: string;
  lectures: Array<{
    id: number;
    title: string;
    duration_minutes: number;
    video_timestamp_start: number;
    video_timestamp_end: number;
  }>;
  instructor: {
    id: string;
    name: string;
    is_verified: boolean;
  };
  thumbnail: string;
}

// Mock Data for Resume Session (will be replaced when sessions are implemented)
const mockResumeSession = {
  courseTitle: 'Advanced React Patterns & Hooks',
  instructorName: 'Sarah Chen',
  progressPercent: 65,
  currentTime: '12:34',
  totalTime: '45:20',
  estimatedCost: 3.45,
};

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Load courses from database
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await apiClient.get('/api/courses', { requiresAuth: false });
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
          console.log('Loaded courses from database:', data.courses);
        } else {
          console.error('Failed to fetch courses:', response.status);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    loadCourses();
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

  // Handle clicking on a course - navigate to video player with course video
  const handleCourseClick = (course: Course) => {
    navigate(`/video-player?v=${course.video_id}&courseId=${course.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />

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

      {/* Available Courses from Database */}
      <section className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">Available Courses</h2>
            <span className="text-emerald-400">📚</span>
          </div>
          <p className="text-gray-400 mb-8">Learn from our curated YouTube courses</p>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 animate-pulse">
                  <div className="h-40 bg-gray-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* YouTube Thumbnail */}
                  <div className="relative h-40 bg-gray-700 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/thumbnails/default.svg';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-emerald-400 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                      {course.category.split(' ')[0]}
                    </div>
                    {course.instructor.is_verified && (
                      <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">by {course.instructor.name}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                    {/* Duration & Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-xs">{course.total_duration_minutes} min</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs">{course.lectures.length} lectures</span>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold text-sm">
                          ₹{course.price_per_minute.toFixed(2)}/min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No courses available yet. Check back soon!</p>
            </div>
          )}
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
