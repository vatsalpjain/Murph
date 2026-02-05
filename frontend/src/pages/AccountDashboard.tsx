import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  RefreshCw,
  Flame,
  Clock,
  PlayCircle,
  Layers,
  CalendarDays,
  BarChart3,
  History,
  Play,
  ArrowLeft,
  LogOut,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
} from "lucide-react";
import LectureEarningsTable from '../components/LectureEarningsTable';
import StudentScoresTable from '../components/StudentScoresTable';
import PopularLecturesChart from '../components/PopularLecturesChart';

// ==================== TYPES ====================

interface StatItem {
  title: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface CalendarDay {
  day: number;
  date: string;
  watched: boolean;
}

interface WeeklyDataPoint {
  day: string;
  hours: number;
}

interface DomainStat {
  name: string;
  hours: number;
  color: string;
}

interface WatchHistoryItem {
  id: string;
  title: string;
  domain: string;
  duration: string;
  watched: string;
  date: string;
  progress: number;
  status: string;
}

// Teacher video analytics types
interface VideoMonthlyData {
  month: string;
  views: number;
}

interface TeacherVideo {
  id: number;
  title: string;
  publishDate: string;
  views: string;
  revenue: string;
  watchTime: string;
  engagement: string;
  completionRate: string;
  monthlyViews: VideoMonthlyData[];
}

// ==================== CONSTANTS ====================

const BACKEND_URL = 'http://localhost:8000';

const domainColors: Record<string, string> = {
  DSA: "bg-green-500/20 text-green-400 border-green-500/30",
  "Data Structures": "bg-green-500/20 text-green-400 border-green-500/30",
  "Algorithms": "bg-green-500/20 text-green-400 border-green-500/30",
  "Web Dev": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Web Development": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "AI/ML": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Machine Learning": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Core CS": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Computer Science": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Music": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Fitness": "bg-red-500/20 text-red-400 border-red-500/30",
};

// Mock video data for teacher analytics (from Option D)
const teacherVideosData: TeacherVideo[] = [
  {
    id: 1,
    title: "Advanced Calculus - Integration Techniques",
    publishDate: "Jan 15, 2026",
    views: "45.2K",
    revenue: "₹8,450",
    watchTime: "245 hrs",
    engagement: "72%",
    completionRate: "68%",
    monthlyViews: [
      { month: "Jan", views: 8200 },
      { month: "Feb", views: 9100 },
      { month: "Mar", views: 7800 },
      { month: "Apr", views: 9900 },
      { month: "May", views: 10200 },
    ],
  },
  {
    id: 2,
    title: "Physics: Quantum Mechanics Fundamentals",
    publishDate: "Jan 12, 2026",
    views: "38.1K",
    revenue: "₹7,120",
    watchTime: "189 hrs",
    engagement: "65%",
    completionRate: "61%",
    monthlyViews: [
      { month: "Jan", views: 6500 },
      { month: "Feb", views: 7200 },
      { month: "Mar", views: 6800 },
      { month: "Apr", views: 8100 },
      { month: "May", views: 9500 },
    ],
  },
  {
    id: 3,
    title: "Organic Chemistry - Reaction Mechanisms",
    publishDate: "Jan 10, 2026",
    views: "52.8K",
    revenue: "₹9,890",
    watchTime: "312 hrs",
    engagement: "78%",
    completionRate: "74%",
    monthlyViews: [
      { month: "Jan", views: 9200 },
      { month: "Feb", views: 10100 },
      { month: "Mar", views: 9800 },
      { month: "Apr", views: 11200 },
      { month: "May", views: 12500 },
    ],
  },
  {
    id: 4,
    title: "Data Structures - Binary Trees Explained",
    publishDate: "Jan 8, 2026",
    views: "61.3K",
    revenue: "₹11,250",
    watchTime: "356 hrs",
    engagement: "81%",
    completionRate: "76%",
    monthlyViews: [
      { month: "Jan", views: 10500 },
      { month: "Feb", views: 11800 },
      { month: "Mar", views: 12100 },
      { month: "Apr", views: 13600 },
      { month: "May", views: 13300 },
    ],
  },
  {
    id: 5,
    title: "Machine Learning - Neural Networks Intro",
    publishDate: "Jan 5, 2026",
    views: "89.7K",
    revenue: "₹16,800",
    watchTime: "412 hrs",
    engagement: "85%",
    completionRate: "82%",
    monthlyViews: [
      { month: "Jan", views: 15300 },
      { month: "Feb", views: 17200 },
      { month: "Mar", views: 18100 },
      { month: "Apr", views: 19400 },
      { month: "May", views: 19700 },
    ],
  },
];

// Generate random teacher data for demonstration
const generateRandomTeacherData = () => {
  const totalEarnings = 12567.50 + Math.random() * 5000;
  const monthlyEarnings = 2340 + Math.random() * 1000;

  const lectures = [
    { course_id: '1', course_title: 'Advanced React Patterns', category: 'Programming', num_lectures: 12, total_sessions: 23, total_students: 18, total_earnings: 2345 + Math.random() * 1000, avg_earnings_per_session: 102, price_per_minute: 2.5 },
    { course_id: '2', course_title: 'Machine Learning Fundamentals', category: 'AI/ML', num_lectures: 15, total_sessions: 31, total_students: 25, total_earnings: 3567 + Math.random() * 1000, avg_earnings_per_session: 115, price_per_minute: 3.0 },
    { course_id: '3', course_title: 'Web Development Bootcamp', category: 'Programming', num_lectures: 20, total_sessions: 45, total_students: 36, total_earnings: 4234 + Math.random() * 1500, avg_earnings_per_session: 94, price_per_minute: 2.0 },
    { course_id: '4', course_title: 'Data Science with Python', category: 'Data Science', num_lectures: 18, total_sessions: 28, total_students: 22, total_earnings: 2421 + Math.random() * 800, avg_earnings_per_session: 86, price_per_minute: 2.2 },
  ];

  const scores = [
    { session_id: '1', student_name: 'Alice Johnson', student_email: 'alice@example.com', course_title: 'Advanced React Patterns', assessment_score: 95, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3600 },
    { session_id: '2', student_name: 'Bob Smith', student_email: 'bob@example.com', course_title: 'Machine Learning Fundamentals', assessment_score: 88, discount_eligible: false, session_date: new Date().toISOString(), duration_seconds: 4200 },
    { session_id: '3', student_name: 'Carol White', student_email: 'carol@example.com', course_title: 'Web Development Bootcamp', assessment_score: 92, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3900 },
    { session_id: '4', student_name: 'David Lee', student_email: 'david@example.com', course_title: 'Data Science with Python', assessment_score: 78, discount_eligible: false, session_date: new Date().toISOString(), duration_seconds: 3300 },
    { session_id: '5', student_name: 'Emma Davis', student_email: 'emma@example.com', course_title: 'Advanced React Patterns', assessment_score: 96, discount_eligible: true, session_date: new Date().toISOString(), duration_seconds: 3750 },
  ];

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

// ==================== STUDENT COMPONENTS ====================

function DashboardHeader({ navigate, user, logout, walletBalance, isTeacher }: {
  navigate: (path: string) => void;
  user: any;
  logout: () => void;
  walletBalance: number;
  isTeacher?: boolean;
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome, <span className="text-green-500">{user?.name || 'User'}!</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          {isTeacher ? 'Track your teaching progress and earnings' : 'Track your learning progress and activity'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wallet className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">{isTeacher ? 'Total Earnings' : 'Account Balance'}</p>
              <p className="text-xl font-bold text-white">₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>
          {!isTeacher && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => navigate('/payment')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Money
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refund
              </button>
            </div>
          )}
          {isTeacher && (
            <button
              onClick={() => navigate('/payment')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ml-4"
            >
              <History className="h-4 w-4" />
              Transactions
            </button>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

function StatsCards({ stats, loading }: { stats: StatItem[], loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
            <div className="h-16 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-slate-800 border border-slate-700 hover:border-green-500/50 transition-colors rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className="text-sm text-slate-400">{stat.unit}</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StreakCalendar({
  calendarDays,
  currentStreak,
  longestStreak,
  loading
}: {
  calendarDays: CalendarDay[],
  currentStreak: number,
  longestStreak: number,
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="flex items-center justify-between p-6 pb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-green-500" />
          Watch Streak Calendar
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400">Current</p>
            <p className="text-lg font-bold text-green-500 flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              {currentStreak}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Longest</p>
            <p className="text-lg font-bold text-white">{longestStreak}</p>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <p className="text-sm text-slate-400 mb-4">February 2026</p>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs text-slate-400 font-medium py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((dayData) => (
            <div
              key={dayData.date}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${dayData.watched
                ? "bg-green-500 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
            >
              {dayData.day}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-slate-400">Watched</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-700" />
            <span className="text-xs text-slate-400">Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyAnalytics({
  weeklyData,
  domains,
  loading
}: {
  weeklyData: WeeklyDataPoint[],
  domains: DomainStat[],
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-64 bg-slate-700 rounded"></div>
      </div>
    );
  }

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="p-6 pb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          Daily Analytics
        </h2>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-green-500 rounded-t-md transition-all duration-300 hover:bg-green-400"
                  style={{ height: `${(data.hours / maxHours) * 100}%` }}
                />
                <span className="text-xs text-slate-400">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm font-medium text-white mb-3">Domain-wise Analytics</p>
            <div className="grid grid-cols-2 gap-3">
              {domains.map((domain) => (
                <div
                  key={domain.name}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                    <span className="text-sm text-white">{domain.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{domain.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WatchHistorySection({
  watchHistory,
  loading
}: {
  watchHistory: WatchHistoryItem[],
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl mt-6 p-6 animate-pulse">
        <div className="h-48 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl mt-6">
      <div className="p-6 pb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-green-500" />
          Watch History
        </h2>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-3">
          {watchHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No watch history yet. Start learning to see your progress!</p>
            </div>
          ) : (
            watchHistory.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors group cursor-pointer"
              >
                <div className="relative w-32 h-20 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20" />
                  <Play className="h-8 w-8 text-white/50 group-hover:text-green-500 transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate group-hover:text-green-500 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${domainColors[video.domain] || "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}
                    >
                      {video.domain}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.watched} watched
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${video.progress === 100 ? "bg-green-500" : "bg-green-500/70"
                        }`}
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-slate-400 shrink-0">{video.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== TEACHER VIDEO ANALYTICS COMPONENTS ====================

// Published videos list with hover-to-expand details
function TeacherVideoList({
  videos,
  selectedVideoId,
  onSelectVideo
}: {
  videos: TeacherVideo[];
  selectedVideoId: number | null;
  onSelectVideo: (id: number) => void;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="border-b border-slate-700 p-4">
        <h2 className="text-lg font-semibold text-white">Published Videos</h2>
        <p className="text-sm text-slate-400">Click a video to view detailed analytics</p>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`flex cursor-pointer flex-col gap-3 border-b border-slate-700/50 p-4 transition-colors ${
              selectedVideoId === video.id ? "bg-slate-700/50" : "hover:bg-slate-700/30"
            }`}
            onMouseEnter={() => setHoveredId(video.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectVideo(video.id)}
          >
            {/* Video basic info */}
            <div className="flex gap-4">
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-700">
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-6 w-6 text-slate-500" />
                </div>
                {hoveredId === video.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Play className="h-8 w-8 text-green-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-white">{video.title}</h3>
                <p className="text-sm text-slate-400">
                  {video.publishDate} • {video.views} views
                </p>
              </div>
            </div>

            {/* Expanded details on hover */}
            {hoveredId === video.id && (
              <div className="grid grid-cols-4 gap-3 border-t border-slate-700/50 pt-3">
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.revenue}</p>
                  <p className="text-xs text-slate-400">Revenue</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.watchTime}</p>
                  <p className="text-xs text-slate-400">Watch Time</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.engagement}</p>
                  <p className="text-xs text-slate-400">Engagement</p>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.completionRate}</p>
                  <p className="text-xs text-slate-400">Completion</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated views analytics chart for selected video
function VideoViewsAnalytics({
  videos,
  selectedVideoId,
  onClose
}: {
  videos: TeacherVideo[];
  selectedVideoId: number | null;
  onClose: () => void;
}) {
  const selectedVideo = videos.find((v) => v.id === selectedVideoId);
  const [animatedData, setAnimatedData] = useState<VideoMonthlyData[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animate chart data when video selection changes
  useEffect(() => {
    if (!selectedVideo) return;

    setIsTransitioning(true);
    const targetData = selectedVideo.monthlyViews;

    // Initialize with zeros if no previous data
    if (animatedData.length === 0) {
      setAnimatedData(targetData.map(d => ({ month: d.month, views: 0 })));
    }

    // Smooth animation to new values
    const duration = 800;
    const startTime = Date.now();
    const startData = animatedData.length > 0 ? animatedData : targetData.map(d => ({ month: d.month, views: 0 }));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth motion
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const newData = targetData.map((target, i) => ({
        month: target.month,
        views: Math.round(startData[i].views + (target.views - startData[i].views) * easeOutCubic)
      }));

      setAnimatedData(newData);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };

    requestAnimationFrame(animate);
  }, [selectedVideoId]);

  // Show placeholder when no video selected
  if (!selectedVideo) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-slate-400">Select a video to view detailed analytics</p>
      </div>
    );
  }

  // Calculate chart dimensions
  const displayData = animatedData.length > 0 ? animatedData : selectedVideo.monthlyViews;
  const maxViews = Math.max(...displayData.map((d) => d.views), 1);
  const minViews = Math.min(...displayData.map((d) => d.views));
  const range = maxViews - minViews || 1;

  // Generate SVG path points for the area chart
  const points = displayData
    .map((d, i) => {
      const x = (i / (displayData.length - 1)) * 100;
      const y = 100 - ((d.views - minViews) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl">
      <div className="border-b border-slate-700 p-4 flex items-start justify-between">
        <div className="transition-opacity duration-300" style={{ opacity: isTransitioning ? 0.7 : 1 }}>
          <h2 className="text-lg font-semibold text-white">Views Analytics</h2>
          <p className="text-sm text-slate-400 transition-all duration-300">{selectedVideo.title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors group"
          title="Close analytics"
        >
          <svg className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6">
        {/* Animated SVG area chart */}
        <div className="relative h-48 w-full mb-6">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill="url(#viewsGradient)" points={areaPoints} style={{ transition: 'all 0.1s ease-out' }} />
            <polyline fill="none" stroke="#10b981" strokeWidth="0.5" points={points} style={{ transition: 'all 0.1s ease-out' }} />
            {displayData.map((d, i) => {
              const x = (i / (displayData.length - 1)) * 100;
              const y = 100 - ((d.views - minViews) / range) * 80 - 10;
              return <circle key={i} cx={x} cy={y} r="1.5" fill="#10b981" style={{ transition: 'all 0.1s ease-out' }} />;
            })}
          </svg>
          <div className="absolute bottom-0 left-0 flex w-full justify-between px-2 text-xs text-slate-400">
            {displayData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Monthly view counts */}
        <div className="grid grid-cols-5 gap-2">
          {displayData.map((d) => (
            <div
              key={d.month}
              className="rounded-lg bg-slate-700/50 p-3 text-center transition-all duration-300"
              style={{ transform: isTransitioning ? 'scale(0.98)' : 'scale(1)' }}
            >
              <p className="text-lg font-semibold text-white tabular-nums">{d.views.toLocaleString()}</p>
              <p className="text-xs text-slate-400">{d.month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

const AccountDashboard = () => {
  const navigate = useNavigate();
  const { user, session, isAuthenticated, logout } = useAuth();

  // Determine if user is a teacher
  const isTeacher = user?.role === 'teacher';

  // State for student dashboard data
  const [stats, setStats] = useState<StatItem[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(100);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [domains, setDomains] = useState<DomainStat[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for teacher dashboard data
  const [teacherData, setTeacherData] = useState<any>(null);
  // State for selected video in teacher analytics
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  // Redirect to home if not authenticated - only once
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Early return if not authenticated to prevent rendering
  if (!isAuthenticated) {
    return null;
  }

  // Fetch dashboard data based on role
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !session) return;

      setLoading(true);
      setError(null);

      // TEACHER: Use random mock data
      if (isTeacher) {
        const data = generateRandomTeacherData();
        setTeacherData(data);
        setWalletBalance(data.totalEarnings);
        setLoading(false);
        return;
      }

      // STUDENT: Fetch real data from API
      try {
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };

        const analyticsRes = await fetch(
          `${BACKEND_URL}/api/stats/user-analytics/${user.id}`,
          { headers }
        );

        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await analyticsRes.json();

        try {
          const balanceRes = await fetch(`${BACKEND_URL}/api/wallet/balance`, { headers });
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            setWalletBalance(balanceData.balance);
          }
        } catch (err) {
          console.error('Failed to fetch wallet balance:', err);
        }

        const fetchedStats: StatItem[] = [
          { title: "Watch Streak", value: analyticsData.current_streak.toString(), unit: "days", icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10" },
          { title: "Total Hours Watched", value: analyticsData.total_hours_watched.toString(), unit: "hours", icon: Clock, color: "text-green-500", bgColor: "bg-green-500/10" },
          { title: "Videos Watched", value: analyticsData.total_videos_watched.toString(), unit: "videos", icon: PlayCircle, color: "text-blue-500", bgColor: "bg-blue-500/10" },
          { title: "Active Domains", value: analyticsData.active_domains.toString(), unit: "domains", icon: Layers, color: "text-purple-500", bgColor: "bg-purple-500/10" },
        ];
        setStats(fetchedStats);

        const calendarRes = await fetch(`${BACKEND_URL}/api/stats/watch-calendar/${user.id}?days=28`, { headers });
        if (!calendarRes.ok) throw new Error('Failed to fetch calendar');
        const calendarData = await calendarRes.json();
        setCalendarDays(calendarData.calendar_days);
        setCurrentStreak(calendarData.current_streak);
        setLongestStreak(calendarData.longest_streak);

        const domainRes = await fetch(`${BACKEND_URL}/api/stats/domain-analytics/${user.id}`, { headers });
        if (!domainRes.ok) throw new Error('Failed to fetch domain analytics');
        const domainData = await domainRes.json();
        setWeeklyData(domainData.weekly_data);
        setDomains(domainData.domains);

        const historyRes = await fetch(`${BACKEND_URL}/api/sessions/user/${user.id}?limit=10`, { headers });
        if (!historyRes.ok) throw new Error('Failed to fetch session history');
        const historyData = await historyRes.json();
        setWatchHistory(historyData.sessions);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, session, isTeacher]);

  // Show error if data fetch failed
  if (error) {
    return (
      <main className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <DashboardHeader navigate={navigate} user={user} logout={logout} walletBalance={walletBalance} isTeacher={isTeacher} />
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // TEACHER DASHBOARD
  if (isTeacher && teacherData) {
    const teacherStats: StatItem[] = [
      { title: "Total Students", value: teacherData.stats.total_students.toString(), unit: "students", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
      { title: "Total Sessions", value: teacherData.stats.total_sessions.toString(), unit: "sessions", icon: BookOpen, color: "text-purple-500", bgColor: "bg-purple-500/10" },
      { title: "Total Earnings", value: `₹${teacherData.totalEarnings.toFixed(0)}`, unit: "", icon: DollarSign, color: "text-green-500", bgColor: "bg-green-500/10" },
      { title: "Avg. Rating", value: teacherData.stats.average_rating.toFixed(1), unit: "/5", icon: TrendingUp, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    ];

    return (
      <main className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <DashboardHeader navigate={navigate} user={user} logout={logout} walletBalance={walletBalance} isTeacher={true} />

          {/* Monthly earnings highlight */}
          {teacherData.monthlyEarnings > 0 && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
              <Award className="h-6 w-6 text-green-500" />
              <p className="text-green-400 font-medium">
                +₹{teacherData.monthlyEarnings.toFixed(2)} earned this month
              </p>
            </div>
          )}

          <StatsCards stats={teacherStats} loading={loading} />

          {/* Video Analytics Section - Animated grid with video list + chart */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Video Performance Analytics</h2>
            <div
              className="grid gap-6 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                gridTemplateColumns: selectedVideoId ? "minmax(350px, 1fr) 2fr" : "1fr",
              }}
            >
              {/* Published videos list */}
              <div className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">
                <TeacherVideoList
                  videos={teacherVideosData}
                  selectedVideoId={selectedVideoId}
                  onSelectVideo={setSelectedVideoId}
                />
              </div>
              {/* Animated views analytics panel */}
              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                  selectedVideoId ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute pointer-events-none'
                }`}
                style={{ maxWidth: selectedVideoId ? '100%' : '0' }}
              >
                <VideoViewsAnalytics
                  videos={teacherVideosData}
                  selectedVideoId={selectedVideoId}
                  onClose={() => setSelectedVideoId(null)}
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <LectureEarningsTable lectures={teacherData.lectures} isLoading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <StudentScoresTable scores={teacherData.scores} isLoading={loading} />
            <PopularLecturesChart lectures={teacherData.popular} isLoading={loading} />
          </div>
        </div>
      </main>
    );
  }

  // STUDENT DASHBOARD
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader navigate={navigate} user={user} logout={logout} walletBalance={walletBalance} isTeacher={false} />
        <StatsCards stats={stats} loading={loading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <StreakCalendar
            calendarDays={calendarDays}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            loading={loading}
          />
          <DailyAnalytics
            weeklyData={weeklyData}
            domains={domains}
            loading={loading}
          />
        </div>
        <WatchHistorySection watchHistory={watchHistory} loading={loading} />
      </div>
    </main>
  );
};

export default AccountDashboard;
