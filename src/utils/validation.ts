/**
 * Holdings form validation utilities for the Mutual Fund Explorer feature.
 * Pure functions for validating user input when adding a holding.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: {
    units?: string;
    purchaseDate?: string;
  };
}

/**
 * Validates the holding form input.
 *
 * Validation rules:
 * 1. units must be parseable as a positive number (> 0)
 * 2. purchaseDate must not be in the future
 * 3. If earliestNAVDate is provided, purchaseDate must be on or after it
 *
 * @param units - The units value entered by the user (as string from input)
 * @param purchaseDate - The purchase date selected by the user
 * @param earliestNAVDate - The earliest date in the fund's NAV history (optional)
 * @returns Validation result with isValid flag and error messages
 */
export function validateHoldingForm(
  units: string,
  purchaseDate: Date,
  earliestNAVDate?: Date,
): ValidationResult {
  const errors: { units?: string; purchaseDate?: string } = {};

  // Rule 1: units must be parseable as a positive number (> 0) and within limit
  const MAX_UNITS = 10000000; // 1 crore
  const parsedUnits = Number(units);
  if (isNaN(parsedUnits) || parsedUnits <= 0) {
    errors.units = "Units must be a valid positive number";
  } else if (parsedUnits > MAX_UNITS) {
    errors.units = "Units cannot exceed 1,00,00,000";
  }

  // Rule 2: purchaseDate must not be in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const purchaseDateNormalized = new Date(purchaseDate);
  purchaseDateNormalized.setHours(0, 0, 0, 0);

  if (purchaseDateNormalized.getTime() > today.getTime()) {
    errors.purchaseDate = "Purchase date cannot be in the future";
  }

  // Rule 3: If earliestNAVDate is provided, purchaseDate must be on or after it
  if (earliestNAVDate && !errors.purchaseDate) {
    const earliestNormalized = new Date(earliestNAVDate);
    earliestNormalized.setHours(0, 0, 0, 0);

    if (purchaseDateNormalized.getTime() < earliestNormalized.getTime()) {
      errors.purchaseDate =
        "Purchase date is before the fund's earliest available NAV date";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
