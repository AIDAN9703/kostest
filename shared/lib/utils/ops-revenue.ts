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
