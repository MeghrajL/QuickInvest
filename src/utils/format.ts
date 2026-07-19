/**
 * Formatting utilities for the Mutual Fund Explorer feature.
 * Handles Indian Rupee formatting, NAV values, units, percentages, and return colors.
 */

/**
 * Formats a number as Indian Rupees with ₹ symbol and Indian numbering system
 * (lakh/crore grouping: rightmost group of 3 digits, subsequent groups of 2 digits).
 *
 * Examples: ₹1,23,456.78, ₹1,000.00
 */
export function formatINR(amount: number): string {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}`;
}

/**
 * Formats a NAV value with up to 4 decimal places, removing trailing zeros.
 *
 * Examples: "123.4567", "45.12", "100"
 */
export function formatNAV(nav: number): string {
  // Use toFixed(4) then remove trailing zeros
  const fixed = nav.toFixed(4);
  // Remove trailing zeros after decimal point, and the decimal point if no decimals remain
  return fixed.replace(/\.?0+$/, '');
}

/**
 * Formats units with up to 3 decimal places, removing trailing zeros.
 *
 * Examples: "100.500", "50", "123.456"
 */
export function formatUnits(units: number): string {
  const fixed = units.toFixed(3);
  return fixed.replace(/\.?0+$/, '');
}

/**
 * Formats a percentage with exactly 2 decimal places followed by %.
 *
 * Examples: "12.34%", "-5.67%"
 */
export function formatPercentage(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

/**
 * Returns the appropriate color for a return value.
 * Red (#e53935) for negative returns, green (#43a047) for zero or positive returns.
 */
export function getReturnColor(returnValue: number): string {
  return returnValue < 0 ? '#e53935' : '#43a047';
}
