import React from 'react';
import { Play, Clock } from 'lucide-react';

interface ResumeCardProps {
  courseTitle: string;
  instructorName: string;
  progressPercent: number;
  currentTime: string;
  totalTime: string;
  estimatedCost: number;
  thumbnail?: string;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  courseTitle,
  instructorName,
  progressPercent,
  currentTime,
  totalTime,
  estimatedCost,
  thumbnail,
}) => {
  return (
    <div className="flex-shrink-0 w-full sm:w-96 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white">
        {thumbnail ? (
          <img src={thumbnail} alt={courseTitle} className="w-full h-full object-cover" />
        ) : (
          <Play className="w-12 h-12" />
        )}
        {/* Progress Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
          <div
            className="h-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
          {courseTitle}
        </h3>
        <p className="text-sm text-gray-400 mb-4">by {instructorName}</p>

        {/* Progress Info */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Clock className="w-4 h-4" />
          <span>{currentTime} / {totalTime}</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progressPercent}% complete</p>
        </div>

        {/* Cost Info */}
        <div className="mb-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <p className="text-xs text-gray-400">Estimated cost to finish</p>
          <p className="text-lg font-bold text-emerald-400">${estimatedCost.toFixed(2)}</p>
        </div>

        {/* Resume Button */}
        <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2">
          <Play className="w-4 h-4" />
          Resume from {currentTime}
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
