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

            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock analytics data
            setAnalytics({
                total_earnings: 45678 + Math.random() * 10000,
                monthly_earnings: 12340 + Math.random() * 3000,
                quality_bonus_earned: 2500 + Math.random() * 1000,
                total_sessions: 127 + Math.floor(Math.random() * 50),
                total_students: 86 + Math.floor(Math.random() * 30),
                average_rating: 4.3 + Math.random() * 0.6,
                total_reviews: 42 + Math.floor(Math.random() * 20),
                is_verified: true
            });

            // Mock lecture earnings
            setLectureEarnings([
                {
                    course_id: '1',
                    course_title: 'Advanced React Patterns & Architecture',
                    category: 'Web Development',
                    num_lectures: 18,
                    total_sessions: 45,
                    total_students: 32,
                    total_earnings: 8450 + Math.random() * 2000,
                    avg_earnings_per_session: 187.78,
                    price_per_minute: 3.5
                },
                {
                    course_id: '2',
                    course_title: 'Machine Learning Fundamentals',
                    category: 'AI/ML',
                    num_lectures: 24,
                    total_sessions: 58,
                    total_students: 41,
                    total_earnings: 12300 + Math.random() * 3000,
                    avg_earnings_per_session: 212.07,
                    price_per_minute: 4.2
                },
                {
                    course_id: '3',
                    course_title: 'Data Structures & Algorithms in Python',
                    category: 'Programming',
                    num_lectures: 32,
                    total_sessions: 72,
                    total_students: 55,
                    total_earnings: 15670 + Math.random() * 4000,
                    avg_earnings_per_session: 217.64,
                    price_per_minute: 3.8
                },
                {
                    course_id: '4',
                    course_title: 'System Design Interview Masterclass',
                    category: 'Career',
                    num_lectures: 15,
                    total_sessions: 34,
                    total_students: 28,
                    total_earnings: 7250 + Math.random() * 1500,
                    avg_earnings_per_session: 213.24,
                    price_per_minute: 4.5
                },
                {
                    course_id: '5',
                    course_title: 'Cloud Computing with AWS',
                    category: 'Cloud',
                    num_lectures: 20,
                    total_sessions: 38,
                    total_students: 30,
                    total_earnings: 9100 + Math.random() * 2000,
                    avg_earnings_per_session: 239.47,
                    price_per_minute: 4.0
                }
            ]);

            // Mock student scores - matching StudentScoresTable interface
            setStudentScores([
                {
                    session_id: 'sess_1',
                    student_name: 'Rahul Sharma',
                    student_email: 'rahul.sharma@email.com',
                    course_title: 'Advanced React Patterns',
                    assessment_score: 87,
                    discount_eligible: false,
                    session_date: '2026-02-04',
                    duration_seconds: 3600
                },
                {
                    session_id: 'sess_2',
                    student_name: 'Priya Patel',
                    student_email: 'priya.patel@email.com',
                    course_title: 'Machine Learning Fundamentals',
                    assessment_score: 92,
                    discount_eligible: true,
                    session_date: '2026-02-05',
                    duration_seconds: 4200
                },
                {
                    session_id: 'sess_3',
                    student_name: 'Amit Kumar',
                    student_email: 'amit.kumar@email.com',
                    course_title: 'Data Structures & Algorithms',
                    assessment_score: 78,
                    discount_eligible: false,
                    session_date: '2026-02-03',
                    duration_seconds: 2800
                },
                {
                    session_id: 'sess_4',
                    student_name: 'Sneha Reddy',
                    student_email: 'sneha.reddy@email.com',
                    course_title: 'System Design Interview',
                    assessment_score: 95,
                    discount_eligible: true,
                    session_date: '2026-02-04',
                    duration_seconds: 3200
                },
                {
                    session_id: 'sess_5',
                    student_name: 'Vikram Singh',
                    student_email: 'vikram.singh@email.com',
                    course_title: 'Cloud Computing with AWS',
                    assessment_score: 88,
                    discount_eligible: false,
                    session_date: '2026-02-05',
                    duration_seconds: 3500
                }
            ]);

            // Mock popular lectures - matching PopularLecturesChart interface
            setPopularLectures([
                {
                    course_id: '1',
                    course_title: 'Introduction to React Hooks',
                    category: 'Web Development',
                    total_enrollments: 245,
                    total_sessions: 52,
                    completed_sessions: 41,
                    completion_rate: 78,
                    total_revenue: 3450,
                    average_rating: 4.7,
                    total_reviews: 23,
                    is_active: true
                },
                {
                    course_id: '2',
                    course_title: 'Neural Networks Deep Dive',
                    category: 'AI/ML',
                    total_enrollments: 312,
                    total_sessions: 68,
                    completed_sessions: 58,
                    completion_rate: 85,
                    total_revenue: 4200,
                    average_rating: 4.8,
                    total_reviews: 31,
                    is_active: true
                },
                {
                    course_id: '3',
                    course_title: 'Binary Trees and Traversals',
                    category: 'Data Structures',
                    total_enrollments: 278,
                    total_sessions: 61,
                    completed_sessions: 49,
                    completion_rate: 80,
                    total_revenue: 3890,
                    average_rating: 4.6,
                    total_reviews: 27,
                    is_active: true
                },
                {
                    course_id: '4',
                    course_title: 'Microservices Architecture',
                    category: 'System Design',
                    total_enrollments: 198,
                    total_sessions: 45,
                    completed_sessions: 38,
                    completion_rate: 84,
                    total_revenue: 3100,
                    average_rating: 4.9,
                    total_reviews: 18,
                    is_active: true
                },
                {
                    course_id: '5',
                    course_title: 'AWS Lambda & Serverless',
                    category: 'Cloud',
                    total_enrollments: 234,
                    total_sessions: 48,
                    completed_sessions: 36,
                    completion_rate: 75,
                    total_revenue: 3650,
                    average_rating: 4.5,
                    total_reviews: 21,
                    is_active: true
                }
            ]);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
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
