/**
 * Money Utilities
 * 
 * All monetary values in the database are stored as CENTS (bigint).
 * This matches Stripe's API and ensures precision in calculations.
 * 
 * RULES:
 * - Database stores cents (e.g., $10.50 = 1050)
 * - Display layer converts to dollars for UI
 * - Never do floating-point math with money - always use integers
 */

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert dollars to cents for storage
 * $10.50 → 1050
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars for display
 * 1050 → 10.50
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert cents to dollars, returning null if input is null/undefined
 */
export function centsToDollarsOrNull(cents: number | null | undefined): number | null {
  if (cents === null || cents === undefined) return null;
  return centsToDollars(cents);
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format cents as currency string for display
 * 1050 → "$10.50"
 * 
 * @param cents - Amount in cents
 * @param options - Formatting options
 */
export function formatCentsAsCurrency(
  cents: number,
  options: {
    showCents?: boolean;
    currency?: string;
  } = {}
): string {
  const { showCents = true, currency = 'USD' } = options;
  const dollars = centsToDollars(cents);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(dollars);
}

/**
 * Format cents as whole dollars (no cents shown)
 * 1050 → "$11" (rounded)
 * 10000 → "$100"
 */
export function formatCentsAsWholeDollars(cents: number): string {
  return formatCentsAsCurrency(cents, { showCents: false });
}

// ============================================================================
// ARITHMETIC FUNCTIONS (all in cents)
// ============================================================================

/**
 * Sum an array of cent values, treating null/undefined as 0
 */
export function sumCents(...values: (number | null | undefined)[]): number {
  return values.reduce<number>((sum, val) => sum + (val ?? 0), 0);
}

/**
 * Calculate percentage of a cent amount
 * Returns rounded cents
 */
export function percentOfCents(cents: number, percentage: number): number {
  return Math.round(cents * percentage);
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a value is a valid cent amount (non-negative integer)
 */
export function isValidCentAmount(value: unknown): value is number {
  return typeof value === 'number' && 
         Number.isInteger(value) && 
         value >= 0;
}

/**
 * Parse a dollar string input to cents
 * "10.50" → 1050
 * "10" → 1000
 * 
 * Throws if input is invalid
 */
export function parseDollarsToCents(input: string): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid dollar amount: ${input}`);
  }
  return dollarsToCents(parsed);
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

/**
 * Type for monetary values in cents
 * Use this to make it clear a value is in cents
 */
export type Cents = number;

/**
 * Type for monetary values in dollars
 * Use this to make it clear a value is in dollars (display only)
 */
export type Dollars = number;
