-- ─────────────────────────────────────────────────────────────────────────
-- DEV CLEANUP: delete every charter-party booking + its group container.
-- Use after testing multi-boat flows, or to clear parties created before the
-- per-boat financials fix (those have GMV/expenses pooled on the lead row).
-- Payments/pricing/ops/expense lines cascade with the booking rows.
-- Run: psql $DATABASE_URL -f scripts/delete-test-charter-party.sql
-- ─────────────────────────────────────────────────────────────────────────

BEGIN;

DELETE FROM booking WHERE booking_group_id IS NOT NULL;

-- Group containers left with no bookings (including older orphans).
DELETE FROM booking_group bg
WHERE NOT EXISTS (SELECT 1 FROM booking b WHERE b.booking_group_id = bg.id);

COMMIT;
