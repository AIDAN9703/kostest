/**
 * Ops GMV uses ops override when set; otherwise falls back to the booking quote total.
 */
export function computeEffectiveGmvCents(
  opsGmvCents: number | null | undefined,
  charterTotalCents: number | null | undefined
): number | null {
  if (opsGmvCents != null && !Number.isNaN(Number(opsGmvCents))) {
    return Math.round(Number(opsGmvCents));
  }
  if (charterTotalCents == null || Number.isNaN(Number(charterTotalCents))) {
    return null;
  }
  return Math.round(Number(charterTotalCents));
}

/**
 * Ops REV is derived from effective GMV minus ops expense (owner payout aggregate).
 */
export function computeOpsRevenueCents(
  opsGmvCents: number | null | undefined,
  charterTotalCents: number | null | undefined,
  expenseCents: number | null | undefined
): number | null {
  const effectiveGmv = computeEffectiveGmvCents(opsGmvCents, charterTotalCents);
  if (effectiveGmv == null) {
    return null;
  }
  const expense = expenseCents ?? 0;
  return Math.round(effectiveGmv - expense);
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
  const gmv = computeEffectiveGmvCents(opsGmvCents, charterTotalCents) ?? 0;
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
