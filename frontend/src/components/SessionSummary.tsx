/**
 * SessionSummary Component
 * Shows session completion summary with payment breakdown
 */

import React from 'react';
import { CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';

interface SessionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    duration: string;
    finalCost: string;
    amountPaid: string;
    amountRefunded: string;
    lockedAmount: string;
    courseName: string;
  };
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  isOpen,
  onClose,
  sessionData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Session Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {sessionData.courseName}
          </p>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          {/* Watch Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Watch Time</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {sessionData.duration}
            </span>
          </div>

          {/* Locked Amount */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Amount Locked
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {sessionData.lockedAmount}
            </span>
          </div>

          {/* Final Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Final Cost</span>
            </div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {sessionData.finalCost}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {/* Refund */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refund</span>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {sessionData.amountRefunded}
            </span>
          </div>

          {/* Total Paid */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">
              Total Paid
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {sessionData.amountPaid}
            </span>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 You only paid for the time you watched! The unused balance has
            been refunded to your wallet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};
