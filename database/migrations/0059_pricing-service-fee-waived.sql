-- The card-processing fee is a cost of paying by card. When a customer settles
-- by Zelle / wire / cash the admin waives it; the fee stays stored for the
-- record and the effective total (subtotal) is what "paid in full" means.
-- Before this, a Zelle payer showed "Deposit paid" forever with 3.5% "due".
ALTER TABLE "booking_pricing"
  ADD COLUMN IF NOT EXISTS "service_fee_waived" boolean NOT NULL DEFAULT false;
