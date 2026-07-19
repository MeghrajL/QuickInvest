/**
 * Chart utilities for the Mutual Fund Explorer feature.
 * Handles downsampling large NAV datasets and filtering by time range.
 */

import { NAVEntry, TimeRange } from '../types/fund';
import { parseNAVDate } from './date';

/**
 * Reduces a large NAV data array to at most maxPoints entries using uniform sampling.
 * Always includes the first and last points to preserve the full range.
 * If data.length <= maxPoints, returns data unchanged.
 *
 * @param data - Array of NAV entries (sorted newest first)
 * @param maxPoints - Maximum number of data points to return
 * @returns Downsampled array of NAV entries
 */
export function downsampleNAVData(data: NAVEntry[], maxPoints: number): NAVEntry[] {
  if (data.length <= maxPoints) {
    return data;
  }

  if (maxPoints <= 0) {
    return [];
  }

  if (maxPoints === 1) {
    return [data[0]];
  }

  const result: NAVEntry[] = [];
  // Always include first point
  result.push(data[0]);

  // Pick evenly spaced indices between first and last
  const step = (data.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  // Always include last point
  result.push(data[data.length - 1]);

  return result;
}

/**
 * Filters NAV entries based on a time range relative to the most recent entry.
 * The data array is expected to be sorted newest first (index 0 = most recent).
 *
 * Time ranges:
 * - '1M': entries from the last 1 month
 * - '3M': entries from the last 3 months
 * - '6M': entries from the last 6 months
 * - '1Y': entries from the last 1 year
 * - 'ALL': all entries returned unchanged
 *
 * The cutoff date is computed by subtracting months from the most recent entry's date.
 * Returns entries whose date >= cutoff date.
 *
 * @param data - Array of NAV entries sorted newest first
 * @param range - Time range filter to apply
 * @returns Filtered array of NAV entries within the specified range
 */
export function filterByTimeRange(data: NAVEntry[], range: TimeRange): NAVEntry[] {
  if (range === 'ALL' || data.length === 0) {
    return data;
  }

  // Most recent entry is at index 0
  const mostRecentDate = parseNAVDate(data[0].date);

  // Compute cutoff date by subtracting months
  const cutoffDate = new Date(mostRecentDate);
  const monthsToSubtract = getMonthsForRange(range);
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);

  // Filter entries whose parsed date >= cutoff date
  return data.filter((entry) => {
    const entryDate = parseNAVDate(entry.date);
    return entryDate.getTime() >= cutoffDate.getTime();
  });
}

/**
 * Maps a TimeRange to the number of months to subtract.
 */
function getMonthsForRange(range: Exclude<TimeRange, 'ALL'>): number {
  switch (range) {
    case '1M':
      return 1;
    case '3M':
      return 3;
    case '6M':
      return 6;
    case '1Y':
      return 12;
  }
}
