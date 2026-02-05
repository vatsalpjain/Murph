// @AI-IGNORE - Legacy file. Student dashboard is now in AccountDashboard.tsx.
"use client"

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
} from "lucide-react"

// ==================== DATA ====================

const stats = [
  {
    title: "Watch Streak",
    value: "12",
    unit: "days",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    streak: [true, true, false, true, true, true, true],
  },
  {
    title: "Total Hours Watched",
    value: "48.5",
    unit: "hours",
    icon: Clock,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Videos Watched",
    value: "127",
    unit: "videos",
    icon: PlayCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Active Domains",
    value: "4",
    unit: "domains",
    icon: Layers,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const calendarDays = [
  { day: 1, watched: true },
  { day: 2, watched: true },
  { day: 3, watched: false },
  { day: 4, watched: true },
  { day: 5, watched: true },
  { day: 6, watched: true },
  { day: 7, watched: true },
  { day: 8, watched: true },
  { day: 9, watched: false },
  { day: 10, watched: true },
  { day: 11, watched: true },
  { day: 12, watched: true },
  { day: 13, watched: true },
  { day: 14, watched: true },
  { day: 15, watched: true },
  { day: 16, watched: false },
  { day: 17, watched: true },
  { day: 18, watched: true },
  { day: 19, watched: true },
  { day: 20, watched: true },
  { day: 21, watched: true },
  { day: 22, watched: true },
  { day: 23, watched: false },
  { day: 24, watched: true },
  { day: 25, watched: true },
  { day: 26, watched: true },
  { day: 27, watched: true },
  { day: 28, watched: true },
]

const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.0 },
  { day: "Fri", hours: 2.8 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.5 },
]

const domains = [
  { name: "DSA", color: "bg-green-500", hours: 9.5 },
  { name: "Web Dev", color: "bg-blue-500", hours: 6.8 },
  { name: "AI/ML", color: "bg-orange-500", hours: 3.8 },
  { name: "Core CS", color: "bg-purple-500", hours: 2.9 },
]

const watchHistory = [
  {
    id: 1,
    title: "Binary Search Algorithm - Complete Tutorial",
    domain: "DSA",
    duration: "45:32",
    watched: "42:15",
    date: "Today",
    progress: 93,
  },
  {
    id: 2,
    title: "React Server Components Deep Dive",
    domain: "Web Dev",
    duration: "1:12:45",
    watched: "1:12:45",
    date: "Today",
    progress: 100,
  },
  {
    id: 3,
    title: "Introduction to Neural Networks",
    domain: "AI/ML",
    duration: "58:20",
    watched: "32:10",
    date: "Yesterday",
    progress: 55,
  },
  {
    id: 4,
    title: "Operating Systems - Process Scheduling",
    domain: "Core CS",
    duration: "52:15",
    watched: "52:15",
    date: "Yesterday",
    progress: 100,
  },
  {
    id: 5,
    title: "Dynamic Programming Patterns",
    domain: "DSA",
    duration: "1:25:00",
    watched: "45:30",
    date: "2 days ago",
    progress: 53,
  },
]

const domainColors: Record<string, string> = {
  DSA: "bg-green-500/20 text-green-400 border-green-500/30",
  "Web Dev": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "AI/ML": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Core CS": "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

const maxHours = Math.max(...weeklyData.map((d) => d.hours))

// ==================== COMPONENTS ====================

function DashboardHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome, <span className="text-green-500">Alex!</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Track your learning progress and activity
        </p>
      </div>

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
    </header>
  )
}

function StatsCards() {
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
          {stat.streak && (
            <div className="flex gap-1 mt-4">
              {stat.streak.map((day, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${
                    day ? "bg-orange-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StreakCalendar() {
  const currentStreak = 12
  const longestStreak = 15

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
          {calendarDays.map(({ day, watched }) => (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                watched
                  ? "bg-green-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {day}
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
  )
}

function DailyAnalytics() {
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
  )
}

function WatchHistorySection() {
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
          {watchHistory.map((video) => (
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
                    className={`text-xs px-2 py-1 rounded border ${domainColors[video.domain]}`}
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
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export default function StudentDashboard() {
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader />
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <StreakCalendar />
          <DailyAnalytics />
        </div>
        <WatchHistorySection />
      </div>
    </main>
  )
}
