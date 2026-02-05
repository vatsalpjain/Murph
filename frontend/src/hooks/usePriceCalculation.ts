/**
 * usePriceCalculation Hook
 * Manages price calculations and display for video sessions
 */

import { useMemo } from 'react';
import {
  calculateCurrentCost,
  calculateRefund,
  formatCurrency,
  formatDuration,
} from '../utils/priceCalculations';

interface UsePriceCalculationProps {
  durationSeconds: number;
  pricePerMinute: number;
  lockedAmount: number;
}

interface PriceCalculation {
  currentCost: number;
  currentCostFormatted: string;
  estimatedRefund: number;
  estimatedRefundFormatted: string;
  durationFormatted: string;
  lockedAmountFormatted: string;
  costPerSecond: number;
}

export const usePriceCalculation = ({
  durationSeconds,
  pricePerMinute,
  lockedAmount,
}: UsePriceCalculationProps): PriceCalculation => {
  const calculations = useMemo(() => {
    // Calculate current cost
    const currentCost = calculateCurrentCost(durationSeconds, pricePerMinute);

    // Ensure cost doesn't exceed locked amount
    const cappedCost = Math.min(currentCost, lockedAmount);

    // Calculate refund
    const estimatedRefund = calculateRefund(lockedAmount, cappedCost);

    // Format values
    const currentCostFormatted = formatCurrency(cappedCost);
    const estimatedRefundFormatted = formatCurrency(estimatedRefund);
    const durationFormatted = formatDuration(durationSeconds);
    const lockedAmountFormatted = formatCurrency(lockedAmount);

    // Calculate cost per second for UI animations
    const costPerSecond = pricePerMinute / 60;

    return {
      currentCost: cappedCost,
      currentCostFormatted,
      estimatedRefund,
      estimatedRefundFormatted,
      durationFormatted,
      lockedAmountFormatted,
      costPerSecond,
    };
  }, [durationSeconds, pricePerMinute, lockedAmount]);

  return calculations;
};
