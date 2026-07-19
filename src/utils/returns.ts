/**
 * Returns computation utilities for the Mutual Fund Explorer feature.
 * Pure functions for calculating current value and returns on holdings.
 */

/**
 * Computes the current value of a holding.
 * currentValue = units × currentNAV
 *
 * @param units - Number of units held
 * @param currentNAV - Current Net Asset Value per unit
 * @returns The current value of the holding
 */
export function computeCurrentValue(units: number, currentNAV: number): number {
  return units * currentNAV;
}

/**
 * Computes the return on a holding.
 * investedValue = units × purchaseNAV
 * returnAmount = currentValue − investedValue
 * returnPercentage = (returnAmount / investedValue) × 100
 *
 * @param units - Number of units held
 * @param currentNAV - Current Net Asset Value per unit
 * @param purchaseNAV - NAV at the time of purchase
 * @returns Object with returnAmount and returnPercentage
 */
export function computeReturn(
  units: number,
  currentNAV: number,
  purchaseNAV: number
): { returnAmount: number; returnPercentage: number } {
  const currentValue = computeCurrentValue(units, currentNAV);
  const investedValue = units * purchaseNAV;
  const returnAmount = currentValue - investedValue;
  const returnPercentage = (returnAmount / investedValue) * 100;

  return { returnAmount, returnPercentage };
}
