import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import {
    LogOut,
    Users,
    BookOpen,
    DollarSign,
    TrendingUp,
    Calendar,
    Plus,
    Award
} from 'lucide-react';
import LectureEarningsTable from '../components/LectureEarningsTable';
import StudentScoresTable from '../components/StudentScoresTable';
import PopularLecturesChart from '../components/PopularLecturesChart';

interface DashboardAnalytics {
    total_earnings: number;
    monthly_earnings: number;
    quality_bonus_earned: number;
    total_sessions: number;
    total_students: number;
    average_rating: number;
    total_reviews: number;
    is_verified: boolean;
}

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [lectureEarnings, setLectureEarnings] = useState<any[]>([]);
    const [studentScores, setStudentScores] = useState<any[]>([]);
    const [popularLectures, setPopularLectures] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all analytics data in parallel
            const [analyticsRes, earningsRes, scoresRes, popularRes] = await Promise.all([
                apiClient.get('/api/teacher/dashboard'),
                apiClient.get('/api/teacher/lecture-earnings'),
                apiClient.get('/api/teacher/student-scores'),
                apiClient.get('/api/teacher/popular-lectures')
            ]);

            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setAnalytics(data);
            }

            if (earningsRes.ok) {
                const data = await earningsRes.json();
                setLectureEarnings(data.lectures || []);
            }

            if (scoresRes.ok) {
                const data = await scoresRes.json();
                setStudentScores(data.student_scores || []);
            }

            if (popularRes.ok) {
                const data = await popularRes.json();
                setPopularLectures(data.popular_lectures || []);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const stats = analytics ? [
        {
            label: 'Total Students',
            value: analytics.total_students.toLocaleString(),
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Total Sessions',
            value: analytics.total_sessions.toLocaleString(),
            icon: BookOpen,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Total Earnings',
            value: `₹${analytics.total_earnings.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Avg. Rating',
            value: analytics.average_rating > 0 ? analytics.average_rating.toFixed(1) : 'N/A',
            icon: TrendingUp,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Murph Instructor
                            </h1>
                            {analytics?.is_verified && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20">
                                    <Award className="w-3 h-3" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-xs text-slate-400">Instructor</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                        <p className="text-slate-400">Welcome back, {user?.name}</p>
                        {analytics && analytics.monthly_earnings > 0 && (
                            <p className="text-sm text-green-400 mt-1">
                                +₹{analytics.monthly_earnings.toLocaleString()} this month
                            </p>
                        )}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" />
                        Create New Course
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isLoading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                    <div className="h-20 bg-slate-700/50 rounded animate-pulse" />
                                </div>
                            ))}
                        </>
                    ) : (
                        stats.map((stat, index) => (
                            <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Lecture-wise Earnings */}
                <div className="mb-8">
                    <LectureEarningsTable lectures={lectureEarnings} isLoading={isLoading} />
                </div>

                {/* Student Scores and Popular Lectures Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <StudentScoresTable scores={studentScores} isLoading={isLoading} />
                    <PopularLecturesChart lectures={popularLectures} isLoading={isLoading} />
                </div>
            </main>
        </div>
    );
}
