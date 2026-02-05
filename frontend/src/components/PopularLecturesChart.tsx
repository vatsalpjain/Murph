import { TrendingUp, Users, Star, DollarSign } from 'lucide-react';

interface PopularLecture {
    course_id: string;
    course_title: string;
    category: string;
    total_enrollments: number;
    total_sessions: number;
    completed_sessions: number;
    completion_rate: number;
    total_revenue: number;
    average_rating: number;
    total_reviews: number;
    is_active: boolean;
}

interface Props {
    lectures: PopularLecture[];
    isLoading?: boolean;
}

export default function PopularLecturesChart({ lectures, isLoading = false }: Props) {
    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Most Popular Lectures
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-slate-700/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (lectures.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Most Popular Lectures
                </h3>
                <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No course data yet</p>
                    <p className="text-sm text-slate-500 mt-1">Create courses to see popularity metrics</p>
                </div>
            </div>
        );
    }

    // Show top 5 lectures
    const topLectures = lectures.slice(0, 5);
    const maxEnrollments = Math.max(...topLectures.map(l => l.total_enrollments), 1);

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Most Popular Lectures
            </h3>

            <div className="space-y-4">
                {topLectures.map((lecture, index) => {
                    const widthPercentage = (lecture.total_enrollments / maxEnrollments) * 100;

                    return (
                        <div key={lecture.course_id} className="relative">
                            {/* Rank Badge */}
                            <div className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-slate-900 shadow-lg">
                                {index + 1}
                            </div>

                            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{lecture.course_title}</h4>
                                        <p className="text-xs text-slate-400">{lecture.category}</p>
                                    </div>
                                    {!lecture.is_active && (
                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-600/50 rounded-full h-2 mb-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${widthPercentage}%` }}
                                    />
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Enrollment</p>
                                            <p className="font-semibold text-white">{lecture.total_enrollments}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Completion</p>
                                            <p className="font-semibold text-white">{lecture.completion_rate}%</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-yellow-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Revenue</p>
                                            <p className="font-semibold text-white">₹{lecture.total_revenue.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-orange-400" />
                                        <div>
                                            <p className="text-xs text-slate-400">Rating</p>
                                            <p className="font-semibold text-white">
                                                {lecture.average_rating > 0
                                                    ? `${lecture.average_rating.toFixed(1)}/5`
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {lectures.length > 5 && (
                <div className="mt-4 text-center text-sm text-slate-400">
                    Showing top 5 of {lectures.length} courses
                </div>
            )}
        </div>
    );
}
