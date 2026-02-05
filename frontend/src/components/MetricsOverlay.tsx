/**
 * MetricsOverlay Component
 * Displays real-time video metrics during playback
 */

import React from 'react';
import { Clock, DollarSign, BookOpen } from 'lucide-react';

interface MetricsOverlayProps {
  currentLecture: { id: number; title: string } | null;
  durationFormatted: string;
  currentCostFormatted: string;
  completionPct: number;
  isVisible: boolean;
}

export const MetricsOverlay: React.FC<MetricsOverlayProps> = ({
  currentLecture,
  durationFormatted,
  currentCostFormatted,
  completionPct,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="grid grid-cols-3 gap-4 text-white">
          {/* Current Lecture */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <div className="text-sm">
              <div className="text-gray-400 text-xs">Current Lecture</div>
              <div className="font-medium truncate">
                {currentLecture
                  ? `${currentLecture.id}. ${currentLecture.title}`
                  : 'Loading...'}
              </div>
            </div>
          </div>

          {/* Watch Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <div className="text-sm">
              <div className="text-gray-400 text-xs">Watch Time</div>
              <div className="font-medium">{durationFormatted}</div>
            </div>
          </div>

          {/* Current Cost */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <div className="text-sm">
              <div className="text-gray-400 text-xs">Current Cost</div>
              <div className="font-medium text-yellow-400">
                {currentCostFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{completionPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(completionPct, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
