-- ============================================================================
-- UNIFY DEALS — FINAL CLEANUP. ⚠️ DO NOT RUN until the backfill has been
-- verified in production for a comfortable period (the plan says a week).
-- After this runs, also delete the deprecated drizzle definitions
-- (inquiry / inquiryEvents tables + inquiry enums) and booking.legacy_inquiry_id,
-- then `drizzle-kit generate` should produce an empty diff.
-- ============================================================================

BEGIN;

ALTER TABLE booking DROP COLUMN IF EXISTS inquiry_id;
DROP TABLE IF EXISTS inquiry_event;
DROP TABLE IF EXISTS inquiry;

-- Enum types owned solely by the inquiry tables:
DROP TYPE IF EXISTS "InquiryEventType";
DROP TYPE IF EXISTS "InquiryStage";
DROP TYPE IF EXISTS "InquiryOutcome";
DROP TYPE IF EXISTS "InquiryLeadType";
DROP TYPE IF EXISTS "InquirySource";
-- NOTE: "PreferredTimeOfDay" and "ContactMethod" are now used by booking
-- columns — do NOT drop those.

COMMIT;
