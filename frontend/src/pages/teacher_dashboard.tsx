// @AI-IGNORE - Legacy file. Teacher dashboard is now in AccountDashboard.tsx (Option D features integrated).
"use client";

import { useState, useEffect } from "react";

// Mock Data
const metricsData = [
  {
    title: "Total Revenue",
    value: "₹76,510",
    change: "+12.5%",
    trend: "up",
    subtitle: "This month",
  },
  {
    title: "Publisher Grade",
    value: "A+",
    change: "Top 5%",
    trend: "up",
    subtitle: "Based on performance",
  },
  {
    title: "Total Views",
    value: "1.2M",
    change: "+8.3%",
    trend: "up",
    subtitle: "Last 30 days",
  },
  {
    title: "Avg. Engagement",
    value: "67%",
    change: "+4.2%",
    trend: "up",
    subtitle: "Watch completion",
  },
];

const videosData = [
  {
    id: 1,
    title: "Advanced Calculus - Integration Techniques",
    thumbnail: "/placeholder.svg",
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
    thumbnail: "/placeholder.svg",
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
    thumbnail: "/placeholder.svg",
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
    thumbnail: "/placeholder.svg",
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
    thumbnail: "/placeholder.svg",
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

// Dynamic analytics data from video revenue
const getAnalyticsData = () => {
  return videosData.map((video) => ({
    title: video.title.split(" - ")[0],
    revenue: parseInt(video.revenue.replace("₹", "").replace(",", "")),
  }));
};

const analyticsData = getAnalyticsData();

// Icons as SVG components
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

// Simple Chart Component
function SimpleAreaChart() {
  const maxRevenue = Math.max(...analyticsData.map((d) => d.revenue));
  const minRevenue = Math.min(...analyticsData.map((d) => d.revenue));
  const range = maxRevenue - minRevenue;

  const points = analyticsData
    .map((d, i) => {
      const x = (i / (analyticsData.length - 1)) * 100;
      const y = 100 - ((d.revenue - minRevenue) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="relative h-48 w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#areaGradient)" points={areaPoints} />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="0.5"
          points={points}
        />
        {analyticsData.map((d, i) => {
          const x = (i / (analyticsData.length - 1)) * 100;
          const y = 100 - ((d.revenue - minRevenue) / range) * 80 - 10;
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#10b981" />;
        })}
      </svg>
      <div className="absolute bottom-0 left-0 flex w-full justify-between px-2 text-xs text-slate-400">
        {analyticsData.map((d) => (
          <span key={d.title}>{d.title}</span>
        ))}
      </div>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="px-6 py-4">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Welcome back, Professor!
        </h1>
        <p className="text-slate-400">
          {"Here's what's happening with your content today."}
        </p>
      </div>
    </header>
  );
}

// Metrics Cards Component
function MetricsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric) => (
        <div
          key={metric.title}
          className="group rounded-xl border border-[#1e4976] bg-[#0f2341] p-5 transition-all hover:border-[#10b981]/50 hover:shadow-lg hover:shadow-[#10b981]/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">{metric.title}</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {metric.value}
              </p>
            </div>
            <div className="rounded-lg bg-[#10b981]/20 p-2">
              <TrendUpIcon className="h-5 w-5 text-[#10b981]" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium text-[#10b981]">
              {metric.change}
            </span>
            <span className="text-xs text-slate-500">{metric.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Video List Component
function VideoList({ selectedVideoId, onSelectVideo }: { selectedVideoId: number | null; onSelectVideo: (id: number) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-[#1e4976] bg-[#0f2341]">
      <div className="border-b border-[#1e4976] p-4">
        <h2 className="text-lg font-semibold text-white">Published Videos</h2>
        <p className="text-sm text-slate-400">Click on a video to view detailed analytics</p>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {videosData.map((video) => (
          <div
            key={video.id}
            className={`flex cursor-pointer flex-col gap-3 border-b border-[#1e4976]/50 p-4 transition-colors ${selectedVideoId === video.id ? "bg-[#1a3a5c]" : "hover:bg-[#1a3a5c]/50"}`}
            onMouseEnter={() => setHoveredId(video.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectVideo(video.id)}
          >
            <div className="flex gap-4">
              <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#1a3a5c]">
                <div className="flex h-full w-full items-center justify-center">
                  <PlayIcon className="h-6 w-6 text-slate-500" />
                </div>
                {hoveredId === video.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <PlayIcon className="h-8 w-8 text-[#10b981]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-white">{video.title}</h3>
                <p className="text-sm text-slate-400">
                  {video.publishDate} - {video.views} views
                </p>
              </div>
            </div>
            {hoveredId === video.id && (
              <div className="grid grid-cols-4 gap-3 border-t border-[#1e4976]/50 pt-3">
                <div className="rounded-lg bg-[#1a3a5c]/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.revenue}</p>
                  <p className="text-xs text-slate-400">Revenue</p>
                </div>
                <div className="rounded-lg bg-[#1a3a5c]/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.watchTime}</p>
                  <p className="text-xs text-slate-400">Watch Time</p>
                </div>
                <div className="rounded-lg bg-[#1a3a5c]/50 p-2 text-center">
                  <p className="font-semibold text-white">{video.engagement}</p>
                  <p className="text-xs text-slate-400">Engagement</p>
                </div>
                <div className="rounded-lg bg-[#1a3a5c]/50 p-2 text-center">
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

// Close Icon Component
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// Views Analytics Component
function ViewsAnalytics({ selectedVideoId, onClose }: { selectedVideoId: number | null; onClose: () => void }) {
  const selectedVideo = videosData.find((v) => v.id === selectedVideoId);
  const [animatedData, setAnimatedData] = useState<{ month: string; views: number }[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animate data when video changes
  useEffect(() => {
    if (!selectedVideo) return;

    setIsTransitioning(true);
    const targetData = selectedVideo.monthlyViews;

    // If no previous data, initialize with zeros
    if (animatedData.length === 0) {
      setAnimatedData(targetData.map(d => ({ month: d.month, views: 0 })));
    }

    // Animate to new values
    const duration = 800;
    const startTime = Date.now();
    const startData = animatedData.length > 0 ? animatedData : targetData.map(d => ({ month: d.month, views: 0 }));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
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

  if (!selectedVideo) {
    return (
      <div className="rounded-xl border border-[#1e4976] bg-[#0f2341] p-6 flex items-center justify-center">
        <p className="text-slate-400">Select a video to view detailed analytics</p>
      </div>
    );
  }

  const displayData = animatedData.length > 0 ? animatedData : selectedVideo.monthlyViews;
  const maxViews = Math.max(...displayData.map((d) => d.views), 1);
  const minViews = Math.min(...displayData.map((d) => d.views));
  const range = maxViews - minViews || 1;

  const points = displayData
    .map((d, i) => {
      const x = (i / (displayData.length - 1)) * 100;
      const y = 100 - ((d.views - minViews) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="rounded-xl border border-[#1e4976] bg-[#0f2341]">
      <div className="border-b border-[#1e4976] p-4 flex items-start justify-between">
        <div className="transition-opacity duration-300" style={{ opacity: isTransitioning ? 0.7 : 1 }}>
          <h2 className="text-lg font-semibold text-white">Views Analytics</h2>
          <p className="text-sm text-slate-400 transition-all duration-300">{selectedVideo.title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#1a3a5c] transition-colors group"
          title="Close analytics"
        >
          <CloseIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>
      <div className="p-6">
        <div className="relative h-64 w-full mb-6">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#viewsGradient)"
              points={areaPoints}
              style={{ transition: 'all 0.1s ease-out' }}
            />
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="0.5"
              points={points}
              style={{ transition: 'all 0.1s ease-out' }}
            />
            {displayData.map((d, i) => {
              const x = (i / (displayData.length - 1)) * 100;
              const y = 100 - ((d.views - minViews) / range) * 80 - 10;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#10b981"
                  style={{ transition: 'all 0.1s ease-out' }}
                />
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 flex w-full justify-between px-2 text-xs text-slate-400">
            {displayData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {displayData.map((d) => (
            <div
              key={d.month}
              className="rounded-lg bg-[#1a3a5c]/50 p-3 text-center transition-all duration-300"
              style={{ transform: isTransitioning ? 'scale(0.98)' : 'scale(1)' }}
            >
              <p className="text-lg font-semibold text-white tabular-nums">
                {d.views.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">{d.month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function TeacherDashboard() {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Header />
      <main className="p-6">
        <MetricsCards />
        <div className="mt-6">
          <div
            className="grid gap-6 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              gridTemplateColumns: selectedVideoId ? "minmax(350px, 1fr) 2fr" : "1fr",
            }}
          >
            <div
              className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: selectedVideoId ? 'scale(1)' : 'scale(1)',
              }}
            >
              <VideoList selectedVideoId={selectedVideoId} onSelectVideo={setSelectedVideoId} />
            </div>
            <div
              className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${selectedVideoId
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full absolute pointer-events-none'
                }`}
              style={{
                maxWidth: selectedVideoId ? '100%' : '0',
              }}
            >
              <ViewsAnalytics selectedVideoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
