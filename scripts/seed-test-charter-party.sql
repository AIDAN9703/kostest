-- ─────────────────────────────────────────────────────────────────────────
-- DEV SEED: a 2-boat charter party (PROPOSED, published, payable) for testing
-- Phase 1 (group checkout/webhook/verify/refund) and Phase 2 (board chip +
-- Charter party card). Safe to run repeatedly — each run creates a fresh
-- party. Run: psql $DATABASE_URL -f scripts/seed-test-charter-party.sql
-- Then find the proposal link: the SELECT at the end prints it.
-- ─────────────────────────────────────────────────────────────────────────

WITH grp AS (
  INSERT INTO booking_group (name)
  VALUES ('Test Party — Two Boats')
  RETURNING id
),
lead_booking AS (
  INSERT INTO booking (
    booking_type, booking_status, source, booking_group_id,
    boat_id, customer_name, customer_email, customer_phone,
    number_of_passengers, start_date_time, end_date_time, is_multi_day,
    needs_captain, pickup_location, public_token, published_at,
    allow_payment, payment_type, terms_accepted
  )
  SELECT
    'EXTERNAL_BOOKING', 'PROPOSED', 'ADMIN', grp.id,
    '8e60d7cf-a5c5-499e-9ed4-8fa1f3431a8a', -- 52ft Prestige (2017)
    'Party Tester', 'aidanalexander97@gmail.com', '7246889698',
    8, '2026-10-15 20:00:00+00', '2026-10-16 00:00:00+00', false,
    true, 'Miami Marina', gen_random_uuid(), NOW(),
    true, 'FULL_PAYMENT', true
  FROM grp
  RETURNING id, booking_group_id, public_token
),
second_booking AS (
  INSERT INTO booking (
    booking_type, booking_status, source, booking_group_id,
    boat_id, customer_name, customer_email, customer_phone,
    number_of_passengers, start_date_time, end_date_time, is_multi_day,
    needs_captain, pickup_location, published_at,
    allow_payment, payment_type, terms_accepted
  )
  SELECT
    'EXTERNAL_BOOKING', 'PROPOSED', 'ADMIN', grp.id,
    'b74488b2-7e7e-4b5b-bd2c-600088c6e70d', -- 62ft Beneteau
    'Party Tester', 'aidanalexander97@gmail.com', '7246889698',
    8, '2026-10-15 20:00:00+00', '2026-10-16 00:00:00+00', false,
    true, 'Miami Marina', NOW(),
    true, 'FULL_PAYMENT', true
  FROM grp
  RETURNING id
),
lead_pricing AS (
  INSERT INTO booking_pricing (
    booking_id, base_price_cents, cleaning_fee_cents, service_fee_cents,
    deposit_amount_cents, total_amount_cents, currency
  )
  SELECT id, 200000, 0, 7000, 50000, 207000, 'USD' FROM lead_booking
  RETURNING booking_id
),
second_pricing AS (
  INSERT INTO booking_pricing (
    booking_id, base_price_cents, cleaning_fee_cents, service_fee_cents,
    deposit_amount_cents, total_amount_cents, currency
  )
  SELECT id, 150000, 0, 5250, 50000, 155250, 'USD' FROM second_booking
  RETURNING booking_id
)
SELECT
  'http://localhost:3000/bookings/proposal/' || lead_booking.public_token AS proposal_url,
  lead_booking.id AS lead_booking_id,
  (SELECT id FROM second_booking) AS second_booking_id
FROM lead_booking, lead_pricing, second_pricing;
