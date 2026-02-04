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
} from "lucide-react";

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

// ==================== COMPONENTS ====================

function DashboardHeader({ navigate, user, logout }: { 
  navigate: (path: string) => void;
  user: any;
  logout: () => void;
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome, <span className="text-green-500">{user?.name || 'Student'}!</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Track your learning progress and activity
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wallet className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Account Balance</p>
              <p className="text-xl font-bold text-white">$2,450</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
              <Plus className="h-4 w-4" />
              Add Money
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refund
            </button>
          </div>
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
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                dayData.watched
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
          {/* Bar Chart */}
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

          {/* Domain Legend */}
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
                {/* Thumbnail placeholder */}
                <div className="relative w-32 h-20 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20" />
                  <Play className="h-8 w-8 text-white/50 group-hover:text-green-500 transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Content */}
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
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        video.progress === 100 ? "bg-green-500" : "bg-green-500/70"
                      }`}
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="text-sm text-slate-400 shrink-0">{video.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

const AccountDashboard = () => {
  const navigate = useNavigate();
  const { user, session, isAuthenticated, logout } = useAuth();

  // State for all dashboard data
  const [stats, setStats] = useState<StatItem[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [domains, setDomains] = useState<DomainStat[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !session) return;

      setLoading(true);
      setError(null);

      try {
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };

        // Fetch user analytics (stats)
        const analyticsRes = await fetch(
          `${BACKEND_URL}/api/stats/user-analytics/${user.id}`,
          { headers }
        );
        
        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await analyticsRes.json();

        // Build stats array from analytics data
        const fetchedStats: StatItem[] = [
          {
            title: "Watch Streak",
            value: analyticsData.current_streak.toString(),
            unit: "days",
            icon: Flame,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
          },
          {
            title: "Total Hours Watched",
            value: analyticsData.total_hours_watched.toString(),
            unit: "hours",
            icon: Clock,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
          },
          {
            title: "Videos Watched",
            value: analyticsData.total_videos_watched.toString(),
            unit: "videos",
            icon: PlayCircle,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            title: "Active Domains",
            value: analyticsData.active_domains.toString(),
            unit: "domains",
            icon: Layers,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
          },
        ];
        setStats(fetchedStats);

        // Fetch watch calendar
        const calendarRes = await fetch(
          `${BACKEND_URL}/api/stats/watch-calendar/${user.id}?days=28`,
          { headers }
        );
        
        if (!calendarRes.ok) throw new Error('Failed to fetch calendar');
        const calendarData = await calendarRes.json();
        
        setCalendarDays(calendarData.calendar_days);
        setCurrentStreak(calendarData.current_streak);
        setLongestStreak(calendarData.longest_streak);

        // Fetch domain analytics
        const domainRes = await fetch(
          `${BACKEND_URL}/api/stats/domain-analytics/${user.id}`,
          { headers }
        );
        
        if (!domainRes.ok) throw new Error('Failed to fetch domain analytics');
        const domainData = await domainRes.json();
        
        setWeeklyData(domainData.weekly_data);
        setDomains(domainData.domains);

        // Fetch session history
        const historyRes = await fetch(
          `${BACKEND_URL}/api/sessions/user/${user.id}?limit=10`,
          { headers }
        );
        
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
  }, [user, session]);

  // Show error if data fetch failed
  if (error) {
    return (
      <main className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <DashboardHeader navigate={navigate} user={user} logout={logout} />
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

  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader navigate={navigate} user={user} logout={logout} />
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
