export interface AppSettings {
  /** Raw stored value, basis points (350 = 3.5%). */
  serviceFeeBps: number;
  /** Decimal rate derived from bps (0.035) — what pricing math consumes. */
  serviceFeeRate: number;
  updatedAt: Date | null;
}
