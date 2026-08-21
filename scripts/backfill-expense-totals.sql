-- Recompute booking_ops.expense_cents (and revenue_cents) from the stored
-- expense-line breakdown, now that expense = ALL categories, not just
-- OWNER_PAYOUT. Only touches bookings that actually have expense lines;
-- legacy manual ops rows without lines keep their figures.
-- Effective GMV mirrors the app: ops.gmv_cents, else quote total − service fee.
WITH sums AS (
  SELECT booking_id, SUM(amount_cents)::bigint AS total_cents
  FROM booking_expense_line
  GROUP BY booking_id
)
UPDATE booking_ops o
SET
  expense_cents = s.total_cents,
  revenue_cents = COALESCE(
    o.gmv_cents,
    p.total_amount_cents - COALESCE(p.service_fee_cents, 0)
  ) - s.total_cents,
  updated_at = NOW()
FROM sums s
LEFT JOIN booking_pricing p ON p.booking_id = s.booking_id
WHERE o.booking_id = s.booking_id
RETURNING o.booking_id, o.expense_cents, o.revenue_cents;
