-- PROD test-data cleanup (2026-08). Keep = bookings created on/after 2026-07-15
-- (the real-customer era; verified: zero older rows have future trips).
-- Users and boats are untouched. booking children cascade via FK; the
-- polymorphic payment table does not, so it is cleared first.

-- 1. Payments attached to test-era bookings (8 rows at time of writing).
DELETE FROM payment
WHERE payable_type = 'BOOKING'
  AND payable_id IN (SELECT id FROM booking WHERE created_at < '2026-07-15');

-- 2. Test-era bookings (227 rows at time of writing). booking_pricing,
--    booking_ops, booking_status_history, booking_event, booking_crew,
--    booking_expense_line, booking_admin_notes all cascade.
DELETE FROM booking WHERE created_at < '2026-07-15';

-- 3. The two real customers stranded in the retired REQUEST flow (Conor
--    Horrigan, Jason Vonick) become plain inquiries so the normal
--    proposal tools work on them.
UPDATE booking
SET booking_status = 'INQUIRY', updated_at = NOW()
WHERE booking_type = 'REQUEST' AND booking_status = 'PENDING'
RETURNING id, customer_name;
