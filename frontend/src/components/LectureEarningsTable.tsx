import { DollarSign, Users, TrendingUp, BookOpen } from 'lucide-react';

interface LectureEarning {
    course_id: string;
    course_title: string;
    category: string;
    num_lectures: number;
    total_sessions: number;
    total_students: number;
    total_earnings: number;
    avg_earnings_per_session: number;
    price_per_minute: number;
}

interface Props {
    lectures: LectureEarning[];
    isLoading?: boolean;
}

export default function LectureEarningsTable({ lectures, isLoading = false }: Props) {
    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Lecture-wise Earnings
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (lectures.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Lecture-wise Earnings
                </h3>
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No completed sessions yet</p>
                    <p className="text-sm text-slate-500 mt-1">Create courses and start teaching!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Lecture-wise Earnings
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left text-sm font-medium text-slate-400 pb-3">Course</th>
                            <th className="text-center text-sm font-medium text-slate-400 pb-3">Lectures</th>
                            <th className="text-center text-sm font-medium text-slate-400 pb-3">Sessions</th>
                            <th className="text-center text-sm font-medium text-slate-400 pb-3">Students</th>
                            <th className="text-right text-sm font-medium text-slate-400 pb-3">Total Earnings</th>
                            <th className="text-right text-sm font-medium text-slate-400 pb-3">Avg/Session</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lectures.map((lecture, index) => (
                            <tr
                                key={lecture.course_id}
                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                            >
                                <td className="py-4">
                                    <div>
                                        <p className="font-medium text-white">{lecture.course_title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{lecture.category}</p>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-sm">
                                        <BookOpen className="w-3 h-3" />
                                        {lecture.num_lectures}
                                    </span>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="text-slate-300">{lecture.total_sessions}</span>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                                        <Users className="w-3 h-3" />
                                        {lecture.total_students}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="font-semibold text-green-400">
                                        ₹{lecture.total_earnings.toLocaleString()}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="text-slate-300">
                                        ₹{lecture.avg_earnings_per_session.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {lectures.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                        Total: {lectures.length} course{lectures.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-300">
                        Combined Earnings:
                        <span className="ml-2 font-semibold text-green-400">
                            ₹{lectures.reduce((sum, l) => sum + l.total_earnings, 0).toLocaleString()}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}
