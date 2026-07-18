-- ============================================================================
-- UNIFY DEALS — BACKFILL (run manually, AFTER the drizzle-generated ALTER
-- migration that adds the INQUIRY status, extended enums, and lead columns)
--
-- What this does:
--   1. Copies every UNCONVERTED inquiry into `booking` as an INQUIRY-status
--      deal, KEEPING THE SAME id (old /admin/bookings/<inquiryId> links keep
--      working; event copy stays trivial).
--        outcome OPEN      -> status INQUIRY
--        outcome LOST      -> status CANCELLED (+ reason from closing event)
--        outcome ABANDONED -> status INQUIRY + archived_at
--   2. Copies ALL inquiry_event history into booking_event:
--        unconverted leads -> onto their new booking row (same id)
--        converted leads   -> onto their existing booking (converted_booking_id)
--   3. Verification queries at the bottom — run them, compare counts.
--
-- Idempotence: step 1 skips ids that already exist in booking; step 2 skips
-- events already copied (matched on metadata->>'legacyInquiryEventId').
-- The inquiry tables are NOT dropped here — see drop-inquiry-tables.sql
-- (only after a verification period).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Unconverted inquiries -> booking rows
-- ----------------------------------------------------------------------------
INSERT INTO booking (
  id,
  booking_type,
  booking_status,
  source,
  boat_id,
  pricing_tier_id,
  assigned_admin_id,
  customer_name,
  customer_email,
  customer_phone,
  needs_captain,
  start_datetime,
  end_datetime,
  number_of_passengers,
  is_multi_day,
  customer_message,
  preferred_date,
  preferred_time_of_day,
  requested_duration_days,
  destination,
  budget_cents,
  estimated_value_cents,
  sms_consent,
  terms_accepted,
  first_contacted_at,
  cold_at,
  archived_at,
  cancelled_at,
  cancellation_reason,
  legacy_inquiry_id,
  created_at,
  updated_at
)
SELECT
  i.id,
  i.lead_type::text::"BookingType",
  CASE
    WHEN i.outcome = 'LOST' THEN 'CANCELLED'
    ELSE 'INQUIRY'
  END::"BookingStatus",
  i.source::text::"BookingSource",
  i.boat_id,
  i.pricing_tier_id,
  i.assigned_to,
  i.name,
  i.email,
  NULLIF(i.phone, ''),
  i.needs_captain,
  i.requested_start_date_time,
  i.requested_end_date_time,
  i.guests,
  CASE WHEN i.lead_type = 'TERM_CHARTER' THEN true ELSE NULL END,
  -- Fold the legacy free-text budget into the message so nothing is lost.
  CASE
    WHEN i.budget IS NOT NULL AND i.budget <> '' AND i.budget_cents IS NULL
      THEN COALESCE(i.message, '') || E'\n\n[Budget: ' || i.budget || ']'
    ELSE i.message
  END,
  COALESCE(i.preferred_date, i.date::date),
  i.preferred_time_of_day,
  i.requested_duration_days,
  i.destination,
  i.budget_cents,
  i.estimated_total_cents,
  COALESCE(i.sms_consent, false),
  i.terms_accepted,
  -- Contacted mark: first logged contact, else updated_at for stages past contact.
  CASE
    WHEN i.stage IN ('CONTACTED', 'QUALIFIED', 'OFFER_SENT', 'CONVERTED') THEN
      COALESCE(
        (SELECT MIN(e.created_at) FROM inquiry_event e
          WHERE e.inquiry_id = i.id AND e.event_type = 'CONTACT_ATTEMPT'),
        i.updated_at
      )
    ELSE NULL
  END,
  CASE WHEN i.stage = 'COLD' THEN i.updated_at ELSE NULL END,
  CASE WHEN i.outcome = 'ABANDONED' THEN i.updated_at ELSE NULL END,
  CASE WHEN i.outcome = 'LOST' THEN i.updated_at ELSE NULL END,
  CASE
    WHEN i.outcome = 'LOST' THEN COALESCE(
      (SELECT e.content FROM inquiry_event e
        WHERE e.inquiry_id = i.id
          AND e.event_type = 'OUTCOME_CHANGE' AND e.new_outcome = 'LOST'
        ORDER BY e.created_at DESC LIMIT 1),
      'Lost (migrated from inquiries)'
    )
    ELSE NULL
  END,
  i.id,
  i.created_at,
  i.updated_at
FROM inquiry i
WHERE i.converted_booking_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM booking b WHERE b.id = i.id);

-- ----------------------------------------------------------------------------
-- 2. Inquiry history -> booking_event (unconverted: same id; converted: their booking)
-- ----------------------------------------------------------------------------
INSERT INTO booking_event (
  booking_id,
  actor_type,
  actor_id,
  event_type,
  channel,
  display_message,
  content,
  contact_method,
  metadata,
  created_at
)
SELECT
  COALESCE(i.converted_booking_id, i.id),
  CASE WHEN e.created_by IS NULL THEN 'system' ELSE 'admin' END,
  e.created_by,
  'lead.' || lower(e.event_type::text),
  'admin_portal',
  CASE e.event_type
    WHEN 'CREATED' THEN 'Inquiry received'
    WHEN 'CONTACT_ATTEMPT' THEN 'Contact logged'
    WHEN 'NOTE' THEN 'Note'
    WHEN 'ASSIGNED' THEN COALESCE(e.content, 'Assigned')
    WHEN 'STAGE_CHANGE' THEN
      'Stage: ' || COALESCE(initcap(replace(e.previous_stage::text, '_', ' ')), '—')
        || ' → ' || COALESCE(initcap(replace(e.new_stage::text, '_', ' ')), '—')
    WHEN 'OUTCOME_CHANGE' THEN
      'Outcome: ' || COALESCE(initcap(e.previous_outcome::text), '—')
        || ' → ' || COALESCE(initcap(e.new_outcome::text), '—')
    ELSE initcap(replace(e.event_type::text, '_', ' '))
  END,
  CASE WHEN e.event_type IN ('NOTE', 'CONTACT_ATTEMPT') THEN e.content ELSE NULL END,
  e.contact_method,
  COALESCE(e.metadata, '{}'::jsonb) || jsonb_build_object('legacyInquiryEventId', e.id),
  e.created_at
FROM inquiry_event e
JOIN inquiry i ON i.id = e.inquiry_id
WHERE NOT EXISTS (
  SELECT 1 FROM booking_event be
  WHERE be.metadata->>'legacyInquiryEventId' = e.id::text
);

COMMIT;

-- ----------------------------------------------------------------------------
-- 3. VERIFY (run after commit; expect zeroes / matching counts)
-- ----------------------------------------------------------------------------
-- Unconverted inquiries vs migrated INQUIRY-origin bookings:
--   SELECT
--     (SELECT COUNT(*) FROM inquiry WHERE converted_booking_id IS NULL) AS inquiries,
--     (SELECT COUNT(*) FROM booking WHERE legacy_inquiry_id IS NOT NULL)  AS migrated;
-- Event copy completeness:
--   SELECT
--     (SELECT COUNT(*) FROM inquiry_event) AS inquiry_events,
--     (SELECT COUNT(*) FROM booking_event WHERE metadata ? 'legacyInquiryEventId') AS copied;
-- Nothing unexpectedly cancelled:
--   SELECT booking_status, COUNT(*) FROM booking
--     WHERE legacy_inquiry_id IS NOT NULL GROUP BY 1;
