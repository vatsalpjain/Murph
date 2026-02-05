/**
 * useVideoMetrics Hook
 * Tracks video playback metrics and syncs to backend every 5 seconds
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { updateSessionMetrics } from '../services/sessionAPI';
import {
  calculateCurrentCost,
  calculateCompletionPercentage,
  getCurrentLecture,
} from '../utils/priceCalculations';

interface Lecture {
  id: number;
  title: string;
  duration_minutes: number;
  video_timestamp_start: number;
  video_timestamp_end: number;
}

interface UseVideoMetricsProps {
  sessionId: string | null;
  pricePerMinute: number;
  lectures: Lecture[];
  isPlaying: boolean;
  videoDuration: number; // Total video duration in seconds
}

interface VideoMetrics {
  durationSeconds: number; // Total billable time (monotonic)
  completionPct: number; // Video completion percentage (0-100)
  currentLecture: { id: number; title: string } | null;
  currentCost: number; // Real-time cost in ₹
  isTracking: boolean;
}

const SYNC_INTERVAL = 5000; // 5 seconds

export const useVideoMetrics = ({
  sessionId,
  pricePerMinute,
  lectures,
  isPlaying,
  videoDuration,
}: UseVideoMetricsProps) => {
  const [metrics, setMetrics] = useState<VideoMetrics>({
    durationSeconds: 0,
    completionPct: 0,
    currentLecture: null,
    currentCost: 0,
    isTracking: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const accumulatedSecondsRef = useRef<number>(0);

  /**
   * Start tracking (when video plays)
   */
  const startTracking = useCallback(() => {
    if (!sessionId) return;

    setMetrics((prev) => ({ ...prev, isTracking: true }));
    lastUpdateRef.current = Date.now();

    // Set up interval to accumulate time and sync
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastUpdateRef.current;
      const elapsedSeconds = elapsedMs / 1000;

      // Accumulate time (monotonic - only increases)
      accumulatedSecondsRef.current += elapsedSeconds;
      lastUpdateRef.current = now;

      // Trigger sync to backend
      syncMetrics(accumulatedSecondsRef.current);
    }, SYNC_INTERVAL);
  }, [sessionId]);

  /**
   * Stop tracking (when video pauses)
   */
  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Accumulate remaining time before pausing
    const now = Date.now();
    const elapsedMs = now - lastUpdateRef.current;
    const elapsedSeconds = elapsedMs / 1000;
    accumulatedSecondsRef.current += elapsedSeconds;
    lastUpdateRef.current = now;

    setMetrics((prev) => ({ ...prev, isTracking: false }));

    // Final sync before stopping
    if (sessionId && accumulatedSecondsRef.current > 0) {
      syncMetrics(accumulatedSecondsRef.current);
    }
  }, [sessionId]);

  /**
   * Sync metrics to backend
   */
  const syncMetrics = async (currentTime: number) => {
    if (!sessionId) return;

    try {
      const completionPct = calculateCompletionPercentage(
        currentTime,
        videoDuration
      );
      const currentLecture = getCurrentLecture(currentTime, lectures);
      const currentCost = calculateCurrentCost(
        accumulatedSecondsRef.current,
        pricePerMinute
      );

      // Update local state
      setMetrics((prev) => ({
        ...prev,
        durationSeconds: Math.floor(accumulatedSecondsRef.current),
        completionPct,
        currentLecture,
        currentCost,
      }));

      // Sync to backend
      await updateSessionMetrics(sessionId, {
        duration_seconds: Math.floor(accumulatedSecondsRef.current),
        completion_pct: completionPct,
        current_lecture: currentLecture?.id,
      });
    } catch (error) {
      console.error('Failed to sync metrics:', error);
      // Continue tracking even if sync fails (retry on next interval)
    }
  };

  /**
   * Update current time (called from video player's timeupdate event)
   */
  const updateCurrentTime = useCallback(
    (currentTime: number) => {
      if (!isPlaying || !sessionId) return;

      const completionPct = calculateCompletionPercentage(
        currentTime,
        videoDuration
      );
      const currentLecture = getCurrentLecture(currentTime, lectures);
      const currentCost = calculateCurrentCost(
        accumulatedSecondsRef.current,
        pricePerMinute
      );

      // Update local state (visual feedback)
      setMetrics((prev) => ({
        ...prev,
        completionPct,
        currentLecture,
        currentCost,
      }));
    },
    [isPlaying, sessionId, videoDuration, lectures, pricePerMinute]
  );

  /**
   * Reset metrics (for new session)
   */
  const resetMetrics = useCallback(() => {
    accumulatedSecondsRef.current = 0;
    lastUpdateRef.current = Date.now();
    setMetrics({
      durationSeconds: 0,
      completionPct: 0,
      currentLecture: null,
      currentCost: 0,
      isTracking: false,
    });
  }, []);

  /**
   * Handle play/pause state changes
   */
  useEffect(() => {
    if (isPlaying) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, startTracking, stopTracking]);

  return {
    metrics,
    updateCurrentTime,
    resetMetrics,
    getTotalDuration: () => accumulatedSecondsRef.current,
  };
};
