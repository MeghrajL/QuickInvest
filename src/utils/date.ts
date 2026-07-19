/**
 * Date utilities for the Mutual Fund Explorer feature.
 * Handles parsing API date format, display formatting, and nearest trading day lookup.
 */

import { NAVEntry } from '../types/fund';

/**
 * Parses a date string in "dd-MM-yyyy" format (as returned by mfapi.in) into a Date object.
 * Sets time to midnight UTC to avoid timezone issues when comparing dates.
 *
 * @param dateStr - Date string in "dd-MM-yyyy" format (e.g., "15-07-2024")
 * @returns Date object representing that date
 */
export function parseNAVDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-');
  // Month is 0-indexed in Date constructor
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

/**
 * Formats a Date object into a human-readable "dd MMM yyyy" format.
 *
 * @param date - Date object to format
 * @returns Formatted string (e.g., "15 Jul 2024")
 */
export function formatDisplayDate(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Finds the NAV entry with the maximum date that is less than or equal to the target date.
 * Uses binary search for efficiency since NAV arrays can contain thousands of entries.
 *
 * The NAV entries from the API are sorted newest first (most recent date at index 0).
 * This means dates are in descending order.
 *
 * @param targetDate - The date to find the nearest preceding trading day for
 * @param navEntries - Array of NAV entries sorted newest first (descending date order)
 * @returns The NAV entry with the maximum date ≤ targetDate, or null if no such entry exists
 */
export function findNearestTradingDay(
  targetDate: Date,
  navEntries: NAVEntry[]
): NAVEntry | null {
  if (navEntries.length === 0) {
    return null;
  }

  const targetTime = targetDate.getTime();

  // Since entries are sorted newest first (descending), we need to find
  // the first entry whose date is ≤ targetDate. In a descending array,
  // this means finding the leftmost entry with date ≤ target.

  let low = 0;
  let high = navEntries.length - 1;
  let result: number = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midDate = parseNAVDate(navEntries[mid].date);
    const midTime = midDate.getTime();

    if (midTime <= targetTime) {
      // This entry's date is ≤ target. It's a candidate.
      // In descending order, we want the leftmost such entry (which has the maximum date ≤ target).
      result = mid;
      high = mid - 1;
    } else {
      // This entry's date is > target. Look to the right (smaller dates).
      low = mid + 1;
    }
  }

  if (result === -1) {
    return null;
  }

  return navEntries[result];
}
