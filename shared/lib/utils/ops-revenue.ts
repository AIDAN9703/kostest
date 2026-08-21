/**
 * Ops GMV uses ops override when set; otherwise falls back to the booking
 * quote total. Pass `serviceFeeCents` to make the fallback fee-exclusive —
 * GMV never includes the service fee (creation writes total − fee), so any
 * revenue/GMV surface should hand the fee in when it has it. Balance-owed
 * surfaces deliberately omit it: the client owes the fee-inclusive total.
 */
export function computeEffectiveGmvCents(
  opsGmvCents: number | null | undefined,
  charterTotalCents: number | null | undefined,
  serviceFeeCents?: number | null
): number | null {
  if (opsGmvCents != null && !Number.isNaN(Number(opsGmvCents))) {
    return Math.round(Number(opsGmvCents));
  }
  if (charterTotalCents == null || Number.isNaN(Number(charterTotalCents))) {
    return null;
  }
  return Math.round(Number(charterTotalCents) - Number(serviceFeeCents ?? 0));
}

/**
 * Ops REV is derived from effective GMV minus ops expense (all cost lines:
 * owner payout, fuel, crew, dockage, …).
 */
export function computeOpsRevenueCents(
  opsGmvCents: number | null | undefined,
  charterTotalCents: number | null | undefined,
  expenseCents: number | null | undefined,
  serviceFeeCents?: number | null
): number | null {
  const effectiveGmv = computeEffectiveGmvCents(opsGmvCents, charterTotalCents, serviceFeeCents);
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
