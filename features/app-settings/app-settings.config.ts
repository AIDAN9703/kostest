/**
 * Client-safe app-settings defaults and helpers (no DB imports).
 *
 * Defaults are the values used when the app_setting row doesn't exist yet
 * (fresh database before the admin saves anything).
 */

export const DEFAULT_APP_SETTINGS = {
  /** 350 bps = 3.5% card processing fee. */
  serviceFeeBps: 350,
  bookingHoldMinutes: 10,
} as const;

/** Basis points → decimal rate (350 → 0.035). */
export function bpsToRate(bps: number): number {
  return bps / 10_000;
}

/** Decimal rate → basis points (0.035 → 350). */
export function rateToBps(rate: number): number {
  return Math.round(rate * 10_000);
}

/**
 * Basis points → human percent string without floating-point artifacts
 * (350 → "3.5", 400 → "4", 325 → "3.25").
 */
export function formatBpsAsPercent(bps: number): string {
  return String(Number((bps / 100).toFixed(2)));
}

/** Decimal rate → percent string ("0.035" → "3.5"). */
export function formatRateAsPercent(rate: number): string {
  return formatBpsAsPercent(rateToBps(rate));
}
