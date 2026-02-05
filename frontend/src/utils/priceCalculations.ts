/**
 * Price Calculation Utilities
 * Pure functions for accurate cost calculations
 */

/**
 * Calculate current cost based on duration and price per minute
 * @param durationSeconds - Total billable seconds
 * @param pricePerMinute - Course price per minute (₹)
 * @returns Current cost in rupees (₹)
 */
export const calculateCurrentCost = (
  durationSeconds: number,
  pricePerMinute: number
): number => {
  const durationMinutes = durationSeconds / 60;
  const cost = durationMinutes * pricePerMinute;
  return Math.round(cost * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate refund amount
 * @param lockedAmount - Initial locked amount (₹)
 * @param finalCost - Actual cost charged (₹)
 * @returns Refund amount (₹)
 */
export const calculateRefund = (
  lockedAmount: number,
  finalCost: number
): number => {
  const refund = lockedAmount - finalCost;
  return Math.max(0, Math.round(refund * 100) / 100); // Ensure non-negative
};

/**
 * Format currency in Indian Rupees
 * @param amount - Amount in rupees
 * @returns Formatted string (e.g., "₹7.69")
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

/**
 * Format duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "15m 23s", "1h 05m", "45s")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Calculate completion percentage
 * @param currentTime - Current video time (seconds)
 * @param totalDuration - Total video duration (seconds)
 * @returns Completion percentage (0-100)
 */
export const calculateCompletionPercentage = (
  currentTime: number,
  totalDuration: number
): number => {
  if (totalDuration === 0) return 0;
  const percentage = (currentTime / totalDuration) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 100) / 100));
};

/**
 * Determine current lecture from video timestamp
 * @param currentTime - Current video time in seconds
 * @param lectures - Array of lecture objects with timestamps
 * @returns Current lecture object or null
 */
export const getCurrentLecture = (
  currentTime: number,
  lectures: Array<{
    id: number;
    title: string;
    video_timestamp_start: number;
    video_timestamp_end: number;
  }>
): { id: number; title: string } | null => {
  if (!lectures || lectures.length === 0) return null;

  for (const lecture of lectures) {
    if (
      currentTime >= lecture.video_timestamp_start &&
      currentTime < lecture.video_timestamp_end
    ) {
      return {
        id: lecture.id,
        title: lecture.title,
      };
    }
  }

  // If past all lectures, return the last one
  const lastLecture = lectures[lectures.length - 1];
  if (currentTime >= lastLecture.video_timestamp_end) {
    return {
      id: lastLecture.id,
      title: lastLecture.title,
    };
  }

  return null;
};
