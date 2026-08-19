-- ─────────────────────────────────────────────────────────────────────────
-- Backfill boat.timezone where it is NULL.
--
-- WHY IT MATTERS: charter times are entered and displayed in the BOAT's local
-- time. A boat with no timezone silently falls back to America/New_York, so a
-- non-Eastern boat shows (and books) the wrong hour.
--
-- Run the SELECT at the bottom FIRST to preview, then run the UPDATEs.
--   psql $DATABASE_URL -f scripts/backfill-boat-timezones.sql
--
-- NOT COVERED HERE — the `timezone` enum has no European or Asian values yet:
--   * 24 Mykonos boats      -> need Europe/Athens
--   * 1 Singapore boat      -> need Asia/Singapore
-- Those require an enum migration first (see the companion task), otherwise
-- the UPDATE will fail with "invalid input value for enum timezone".
-- ─────────────────────────────────────────────────────────────────────────

BEGIN;

-- South Florida marinas + US East Coast
UPDATE boat SET timezone = 'America/New_York'
WHERE timezone IS NULL
  AND (
    location_label ILIKE '%miami%'
    OR location_label ILIKE '%fort lauderdale%'
    OR location_label ILIKE '%venetian%'
    OR location_label ILIKE '%coconut grove%'
    OR location_label ILIKE '%bayshore%'
    OR location_label ILIKE '%haulover%'
    OR location_label ILIKE '%bill bird%'
    OR location_label ILIKE '%regal marina%'
    OR location_label ILIKE '%palm harbor%'
    OR location_label ILIKE '%bayside%'
    OR location_label ILIKE '%bal harbo%'
    OR location_label ILIKE '%loggerhead%'
    OR location_label ILIKE '%hollywood, fl%'
    OR location_label ILIKE '%sarasota%'
    OR location_label ILIKE '%, fl%'
    OR location_label ILIKE '%stamford%'
    OR location_label ILIKE '%, ct%'
  );

-- Dominican Republic (no daylight saving — the offset vs Miami changes twice a year)
UPDATE boat SET timezone = 'America/Santo_Domingo'
WHERE timezone IS NULL
  AND (location_label ILIKE '%punta cana%' OR location_label ILIKE '%cap cana%');

COMMIT;

-- What's still missing after the backfill (expect Mykonos, Singapore, and any
-- boat with no location label — those need a human decision):
SELECT COALESCE(location_label, '(no location)') AS location,
       COUNT(*)::int AS boats_still_missing_timezone
FROM boat
WHERE timezone IS NULL
GROUP BY 1
ORDER BY 2 DESC;
