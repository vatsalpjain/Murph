import { Trophy, Award, BookOpen } from 'lucide-react';

interface StudentScore {
    session_id: string;
    student_name: string;
    student_email: string;
    course_title: string;
    assessment_score: number;
    discount_eligible: boolean;
    session_date: string;
    duration_seconds: number;
}

interface Props {
    scores: StudentScore[];
    isLoading?: boolean;
}

export default function StudentScoresTable({ scores, isLoading = false }: Props) {
    if (isLoading) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Student MCQ Scores
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (scores.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Student MCQ Scores
                </h3>
                <div className="text-center py-12">
                    <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No assessment results yet</p>
                    <p className="text-sm text-slate-500 mt-1">Students haven't completed MCQ tests</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-blue-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 90) return 'bg-green-500/10';
        if (score >= 75) return 'bg-blue-500/10';
        if (score >= 60) return 'bg-yellow-500/10';
        return 'bg-red-500/10';
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Student MCQ Scores
                </h3>
                <div className="text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded">
                        <Award className="w-3 h-3" />
                        ≥90% = Discount Eligible
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left text-sm font-medium text-slate-400 pb-3">Student</th>
                            <th className="text-left text-sm font-medium text-slate-400 pb-3">Course</th>
                            <th className="text-center text-sm font-medium text-slate-400 pb-3">Score</th>
                            <th className="text-center text-sm font-medium text-slate-400 pb-3">Status</th>
                            <th className="text-right text-sm font-medium text-slate-400 pb-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score) => (
                            <tr
                                key={score.session_id}
                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                            >
                                <td className="py-4">
                                    <div>
                                        <p className="font-medium text-white">{score.student_name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{score.student_email}</p>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-slate-500" />
                                        <span className="text-slate-300 text-sm">{score.course_title}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center">
                                    <span
                                        className={`inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold ${getScoreColor(
                                            score.assessment_score
                                        )} ${getScoreBgColor(score.assessment_score)}`}
                                    >
                                        {score.assessment_score}%
                                    </span>
                                </td>
                                <td className="py-4 text-center">
                                    {score.discount_eligible ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                                            <Award className="w-3 h-3" />
                                            Eligible
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 text-xs">—</span>
                                    )}
                                </td>
                                <td className="py-4 text-right text-sm text-slate-400">
                                    {formatDate(score.session_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                <span className="text-slate-400">
                    Total: {scores.length} assessment{scores.length !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-300">
                    Discount Eligible:
                    <span className="ml-2 font-semibold text-green-400">
                        {scores.filter(s => s.discount_eligible).length}
                    </span>
                </span>
            </div>
        </div>
    );
}
