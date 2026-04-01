/**
 * Ops REV is derived from the booking quote total (GMV) minus ops expense.
 * Source of truth for GMV: `booking_pricing.total_amount_cents`.
 */
export function computeOpsRevenueCents(
  totalAmountCents: number | null | undefined,
  expenseCents: number | null | undefined
): number | null {
  if (totalAmountCents == null || Number.isNaN(Number(totalAmountCents))) {
    return null;
  }
  const expense = expenseCents ?? 0;
  return Math.round(Number(totalAmountCents) - expense);
}

/**
 * Amount the client still owes on the charter: **GMV − PAID** (cents).
 * Uses ops `gmv_cents` when set; if empty, uses the booking quote total
 * (`booking_pricing.total_amount_cents`) so PAID isn’t compared to $0 when GMV wasn’t filled in yet.
 */
export function computeOpsBalanceClientCents(
  opsGmvCents: number | null | undefined,
  paidCents: number | null | undefined,
  charterTotalCents?: number | null
): number {
  const gmv = opsGmvCents ?? charterTotalCents ?? 0;
  return gmv - (paidCents ?? 0);
}

/**
 * Owner-side balance: **ops expense − cumulative sent to owner** (cents).
 */
export function computeOpsBalanceOwnerCents(
  expenseCents: number | null | undefined,
  sentToOwnerCents: number | null | undefined
): number {
  return (expenseCents ?? 0) - (sentToOwnerCents ?? 0);
}
