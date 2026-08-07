-- Custom SQL migration file, put your code below! --

-- ============================================================================
-- HARD GUARANTEE AGAINST DOUBLE-BOOKINGS
--
-- The database becomes the last line of defense: two calendar-blocking
-- bookings (APPROVED / CONFIRMED) for the same boat can never hold
-- overlapping time ranges, no matter which code path writes them or how
-- badly two requests race. Any INSERT or UPDATE that would create an
-- overlap fails with error 23P01, which the app catches and surfaces as a
-- friendly "slot taken" message.
--
-- Ranges are half-open [start, end): back-to-back charters that share an
-- exact boundary (12:00–16:00 then 16:00–20:00) do NOT conflict.
--
-- ⚠ PRE-FLIGHT (run BOTH queries against each environment before migrating —
--   the constraints cannot be created while violating rows exist):
--
--   1) Inverted ranges (end before start — found 1 such row in dev):
--   SELECT id, customer_name, booking_status, start_datetime, end_datetime
--   FROM booking
--   WHERE start_datetime IS NOT NULL AND end_datetime IS NOT NULL
--     AND end_datetime <= start_datetime;
--
--   Repair (swaps the inverted pair in place):
--   UPDATE booking
--     SET start_datetime = end_datetime, end_datetime = start_datetime
--   WHERE end_datetime < start_datetime;
--
--   2) Overlapping blocking pairs (the Saturday incident — cancel/move one):
--   SELECT a.id, b.id, a.boat_id, a.customer_name, b.customer_name,
--          a.start_datetime, a.end_datetime, b.start_datetime, b.end_datetime
--   FROM booking a
--   JOIN booking b ON a.boat_id = b.boat_id AND a.id < b.id
--   WHERE a.booking_status IN ('APPROVED','CONFIRMED')
--     AND b.booking_status IN ('APPROVED','CONFIRMED')
--     AND a.start_datetime < b.end_datetime
--     AND a.end_datetime  > b.start_datetime;
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
-- A booking can never end before it starts — the inverted "Jane Doe" row
-- proved this class of corruption is real, so the DB now rejects it.
ALTER TABLE "booking" ADD CONSTRAINT "booking_time_range_valid"
  CHECK (
    "start_datetime" IS NULL
    OR "end_datetime" IS NULL
    OR "end_datetime" > "start_datetime"
  );
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_no_overlap"
  EXCLUDE USING gist (
    "boat_id" WITH =,
    tstzrange("start_datetime", "end_datetime", '[)') WITH &&
  )
  WHERE (
    "booking_status" IN ('APPROVED', 'CONFIRMED')
    AND "boat_id" IS NOT NULL
    AND "start_datetime" IS NOT NULL
    AND "end_datetime" IS NOT NULL
  );
