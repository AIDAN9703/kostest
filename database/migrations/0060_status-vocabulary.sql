-- ============================================================================
-- ONE DEAL VOCABULARY
--
--   INQUIRY → PROPOSED → BOOKED → COMPLETED, with CANCELLED off to the side.
--
-- Why: the old seven values mixed three ideas. DRAFT and PENDING were both
-- "a priced proposal the customer is looking at" (→ PROPOSED). APPROVED and
-- CONFIRMED were both "the trip is theirs" and differed only by whether
-- money had landed — payment is a label derived from the payments ledger
-- (unpaid / deposit paid / paid), never a status (→ BOOKED).
--
-- Postgres cannot drop values from an enum, so: new type, remap both
-- columns that carry it (booking, booking_status_history), swap the types,
-- and rebuild the no-overlap constraint on the one status that holds a slot.
--
-- PRE-FLIGHT (run on each environment first):
--   SELECT booking_status, count(*) FROM booking GROUP BY 1 ORDER BY 2 DESC;
-- Nothing new can violate the rebuilt constraint: APPROVED and CONFIRMED
-- were already both blocking, and PENDING/DRAFT → PROPOSED does not block.
--
-- POST-FLIGHT:
--   SELECT booking_status, count(*) FROM booking GROUP BY 1;
--   SELECT conname FROM pg_constraint WHERE conname = 'booking_no_overlap';
--   SELECT enum_range(NULL::"BookingStatus");
-- ============================================================================

CREATE TYPE "BookingStatusNext" AS ENUM ('INQUIRY', 'PROPOSED', 'BOOKED', 'COMPLETED', 'CANCELLED');
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT IF EXISTS "booking_no_overlap";
--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "booking_status" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "booking"
  ALTER COLUMN "booking_status" TYPE "BookingStatusNext"
  USING (
    CASE "booking_status"::text
      WHEN 'DRAFT' THEN 'PROPOSED'
      WHEN 'PENDING' THEN 'PROPOSED'
      WHEN 'APPROVED' THEN 'BOOKED'
      WHEN 'CONFIRMED' THEN 'BOOKED'
      ELSE "booking_status"::text
    END
  )::"BookingStatusNext";
--> statement-breakpoint
ALTER TABLE "booking_status_history"
  ALTER COLUMN "from_status" TYPE "BookingStatusNext"
  USING (
    CASE "from_status"::text
      WHEN 'DRAFT' THEN 'PROPOSED'
      WHEN 'PENDING' THEN 'PROPOSED'
      WHEN 'APPROVED' THEN 'BOOKED'
      WHEN 'CONFIRMED' THEN 'BOOKED'
      ELSE "from_status"::text
    END
  )::"BookingStatusNext";
--> statement-breakpoint
ALTER TABLE "booking_status_history"
  ALTER COLUMN "to_status" TYPE "BookingStatusNext"
  USING (
    CASE "to_status"::text
      WHEN 'DRAFT' THEN 'PROPOSED'
      WHEN 'PENDING' THEN 'PROPOSED'
      WHEN 'APPROVED' THEN 'BOOKED'
      WHEN 'CONFIRMED' THEN 'BOOKED'
      ELSE "to_status"::text
    END
  )::"BookingStatusNext";
--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "booking_status" SET DEFAULT 'INQUIRY';
--> statement-breakpoint
DROP TYPE "BookingStatus";
--> statement-breakpoint
ALTER TYPE "BookingStatusNext" RENAME TO "BookingStatus";
--> statement-breakpoint
-- BOOKED is the one status that holds a slot. Half-open ranges: back-to-back
-- charters sharing an exact boundary do not conflict.
ALTER TABLE "booking" ADD CONSTRAINT "booking_no_overlap"
  EXCLUDE USING gist (
    "boat_id" WITH =,
    tstzrange("start_datetime", "end_datetime", '[)') WITH &&
  )
  WHERE (
    "booking_status" = 'BOOKED'
    AND "boat_id" IS NOT NULL
    AND "start_datetime" IS NOT NULL
    AND "end_datetime" IS NOT NULL
  );
