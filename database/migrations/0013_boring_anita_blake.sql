-- ============================================================================
-- BOOKING SCHEMA REDESIGN MIGRATION
-- Creates new tables: booking_pricing, booking_status_history, booking_admin_note, payment
-- Adds new columns to: booking, proposal
-- Migrates existing data from booking table to new tables
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE NEW ENUMS
-- ============================================================================

CREATE TYPE "public"."AdminNoteType" AS ENUM('GENERAL', 'CONTACTED', 'FOLLOW_UP', 'ISSUE');--> statement-breakpoint
CREATE TYPE "public"."BookingSource" AS ENUM('WEBSITE', 'ADMIN', 'PROPOSAL', 'BROKER');--> statement-breakpoint
CREATE TYPE "public"."PayableType" AS ENUM('BOOKING', 'EVENT_TICKET');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethodType" AS ENUM('STRIPE_CHECKOUT', 'STRIPE_LINK', 'STRIPE_INVOICE', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."PaymentType" AS ENUM('DEPOSIT', 'FULL_PAYMENT', 'PARTIAL', 'ADDITIONAL', 'REFUND');--> statement-breakpoint

-- Create new PaymentStatus enum with different name first (to avoid conflicts)
CREATE TYPE "public"."PaymentStatusNew" AS ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED', 'CHARGEBACK');--> statement-breakpoint

-- ============================================================================
-- STEP 2: CREATE NEW TABLES
-- ============================================================================

CREATE TABLE "booking_pricing" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"base_price_cents" bigint NOT NULL,
	"captain_fee_cents" bigint,
	"cleaning_fee_cents" bigint,
	"service_fee_cents" bigint,
	"tax_amount_cents" bigint,
	"discount_amount_cents" bigint,
	"discount_code" text,
	"deposit_amount_cents" bigint,
	"total_amount_cents" bigint NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"deposit_due_date" timestamp with time zone,
	"remainder_due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "booking_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"from_status" "BookingStatus",
	"to_status" "BookingStatus" NOT NULL,
	"changed_by_user_id" uuid,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "booking_admin_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"note_type" "AdminNoteType" DEFAULT 'GENERAL' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payable_type" "PayableType" NOT NULL,
	"payable_id" uuid NOT NULL,
	"payment_type" "PaymentType" NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "PaymentStatusNew" DEFAULT 'PENDING' NOT NULL,
	"payment_method_type" "PaymentMethodType" NOT NULL,
	"payment_method_detail" text,
	"stripe_payment_intent_id" text,
	"stripe_checkout_session_id" text,
	"stripe_payment_link_id" text,
	"stripe_invoice_id" text,
	"stripe_customer_id" text,
	"notes" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

-- ============================================================================
-- STEP 3: ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================================================

ALTER TABLE "booking" ADD COLUMN "source" "BookingSource" DEFAULT 'WEBSITE';--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "proposal_id" uuid;--> statement-breakpoint

ALTER TABLE "proposal" ADD COLUMN "accepted_option_id" uuid;--> statement-breakpoint
ALTER TABLE "proposal" ADD COLUMN "converted_to_booking_id" uuid;--> statement-breakpoint
ALTER TABLE "proposal" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint

-- ============================================================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE "booking_pricing" ADD CONSTRAINT "booking_pricing_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_changed_by_user_id_user_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_admin_note" ADD CONSTRAINT "booking_admin_note_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_admin_note" ADD CONSTRAINT "booking_admin_note_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- ============================================================================
-- STEP 5: CREATE INDEXES
-- ============================================================================

CREATE INDEX "booking_status_history_booking_idx" ON "booking_status_history" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_status_history_to_status_idx" ON "booking_status_history" USING btree ("to_status");--> statement-breakpoint
CREATE INDEX "booking_status_history_created_idx" ON "booking_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "booking_admin_note_booking_idx" ON "booking_admin_note" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_admin_note_admin_idx" ON "booking_admin_note" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "booking_admin_note_created_idx" ON "booking_admin_note" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_payable_idx" ON "payment" USING btree ("payable_type","payable_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_stripe_intent_idx" ON "payment" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "booking_source_idx" ON "booking" USING btree ("source");--> statement-breakpoint
CREATE INDEX "booking_proposal_idx" ON "booking" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_converted_booking_idx" ON "proposal" USING btree ("converted_to_booking_id");--> statement-breakpoint

-- ============================================================================
-- STEP 6: MIGRATE DATA - Copy pricing from booking to booking_pricing
-- Convert dollars (doublePrecision) to cents (bigint) by multiplying by 100
-- ============================================================================

INSERT INTO "booking_pricing" (
    "booking_id",
    "base_price_cents",
    "captain_fee_cents",
    "cleaning_fee_cents",
    "service_fee_cents",
    "tax_amount_cents",
    "discount_amount_cents",
    "deposit_amount_cents",
    "total_amount_cents",
    "currency",
    "created_at",
    "updated_at"
)
SELECT 
    b.id,
    -- base_price = total - fees + discount (reverse calculate)
    ROUND((COALESCE(b.total_amount, 0) - COALESCE(b.captain_fee, 0) - COALESCE(b.cleaning_fee, 0) - COALESCE(b.service_fee, 0) - COALESCE(b.tax_amount, 0) + COALESCE(b.discount_amount, 0)) * 100)::bigint,
    CASE WHEN b.captain_fee IS NOT NULL THEN ROUND(b.captain_fee * 100)::bigint ELSE NULL END,
    CASE WHEN b.cleaning_fee IS NOT NULL THEN ROUND(b.cleaning_fee * 100)::bigint ELSE NULL END,
    CASE WHEN b.service_fee IS NOT NULL THEN ROUND(b.service_fee * 100)::bigint ELSE NULL END,
    CASE WHEN b.tax_amount IS NOT NULL THEN ROUND(b.tax_amount * 100)::bigint ELSE NULL END,
    CASE WHEN b.discount_amount IS NOT NULL THEN ROUND(b.discount_amount * 100)::bigint ELSE NULL END,
    CASE WHEN b.deposit_amount IS NOT NULL THEN ROUND(b.deposit_amount * 100)::bigint ELSE NULL END,
    ROUND(b.total_amount * 100)::bigint,
    COALESCE(b.currency, 'USD'),
    b.created_at,
    b.updated_at
FROM "booking" b
WHERE NOT EXISTS (
    SELECT 1 FROM "booking_pricing" bp WHERE bp.booking_id = b.id
);--> statement-breakpoint

-- ============================================================================
-- STEP 7: MIGRATE DATA - Create initial status history entries
-- ============================================================================

INSERT INTO "booking_status_history" (
    "booking_id",
    "from_status",
    "to_status",
    "changed_by_user_id",
    "reason",
    "created_at"
)
SELECT 
    b.id,
    NULL, -- No previous status (this is the initial state)
    b.booking_status,
    NULL, -- System migration
    'Initial status from migration',
    b.created_at
FROM "booking" b
WHERE NOT EXISTS (
    SELECT 1 FROM "booking_status_history" bsh WHERE bsh.booking_id = b.id
);--> statement-breakpoint

-- ============================================================================
-- STEP 8: MIGRATE DATA - Create payment records from existing bookings
-- (Only for bookings that have payment info)
-- Convert dollars to cents
-- ============================================================================

INSERT INTO "payment" (
    "payable_type",
    "payable_id",
    "payment_type",
    "amount_cents",
    "currency",
    "status",
    "payment_method_type",
    "payment_method_detail",
    "stripe_payment_intent_id",
    "stripe_payment_link_id",
    "stripe_customer_id",
    "processed_at",
    "created_at"
)
SELECT 
    'BOOKING',
    b.id,
    'FULL_PAYMENT',
    ROUND(b.total_amount * 100)::bigint,
    COALESCE(b.currency, 'USD'),
    CASE 
        WHEN b.payment_status::text = 'PAID' THEN 'SUCCEEDED'::"PaymentStatusNew"
        WHEN b.payment_status::text = 'REFUNDED' THEN 'REFUNDED'::"PaymentStatusNew"
        WHEN b.payment_status::text = 'FAILED' THEN 'FAILED'::"PaymentStatusNew"
        WHEN b.payment_status::text = 'CHARGEBACK' THEN 'CHARGEBACK'::"PaymentStatusNew"
        ELSE 'PENDING'::"PaymentStatusNew"
    END,
    CASE 
        WHEN b.stripe_payment_link_id IS NOT NULL THEN 'STRIPE_LINK'::"PaymentMethodType"
        WHEN b.stripe_payment_intent_id IS NOT NULL THEN 'STRIPE_CHECKOUT'::"PaymentMethodType"
        ELSE 'MANUAL'::"PaymentMethodType"
    END,
    b.payment_method,
    b.stripe_payment_intent_id,
    b.stripe_payment_link_id,
    b.stripe_customer_id,
    CASE WHEN b.payment_status::text = 'PAID' THEN b.updated_at ELSE NULL END,
    b.created_at
FROM "booking" b
WHERE (b.stripe_payment_intent_id IS NOT NULL 
   OR b.stripe_payment_link_id IS NOT NULL
   OR b.payment_status::text = 'PAID')
   AND NOT EXISTS (
       SELECT 1 FROM "payment" p WHERE p.payable_type = 'BOOKING' AND p.payable_id = b.id
   );--> statement-breakpoint

-- ============================================================================
-- STEP 9: MIGRATE DATA - Create admin notes from contacted_at
-- ============================================================================

INSERT INTO "booking_admin_note" (
    "booking_id",
    "admin_user_id",
    "note_type",
    "content",
    "created_at"
)
SELECT 
    b.id,
    COALESCE(b.assigned_admin_id, b.reviewed_by), -- Use assigned admin or reviewer
    'CONTACTED',
    'Customer contacted (migrated from legacy contacted_at field)',
    b.contacted_at
FROM "booking" b
WHERE b.contacted_at IS NOT NULL 
  AND (b.assigned_admin_id IS NOT NULL OR b.reviewed_by IS NOT NULL)
  AND NOT EXISTS (
      SELECT 1 FROM "booking_admin_note" ban 
      WHERE ban.booking_id = b.id AND ban.note_type = 'CONTACTED'
  );--> statement-breakpoint

-- ============================================================================
-- STEP 10: Handle PaymentStatus enum migration for booking table
-- The old enum has: AWAITING_PAYMENT, PAID, FAILED, REFUNDED, CHARGEBACK
-- The new enum has: PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, CANCELLED, CHARGEBACK
-- ============================================================================

-- Add new column with new enum type
ALTER TABLE "booking" ADD COLUMN "payment_status_new" "PaymentStatusNew";--> statement-breakpoint

-- Migrate data to new column with value mapping
UPDATE "booking" SET "payment_status_new" = 
    CASE 
        WHEN payment_status::text = 'AWAITING_PAYMENT' THEN 'PENDING'::"PaymentStatusNew"
        WHEN payment_status::text = 'PAID' THEN 'SUCCEEDED'::"PaymentStatusNew"
        WHEN payment_status::text = 'FAILED' THEN 'FAILED'::"PaymentStatusNew"
        WHEN payment_status::text = 'REFUNDED' THEN 'REFUNDED'::"PaymentStatusNew"
        WHEN payment_status::text = 'CHARGEBACK' THEN 'CHARGEBACK'::"PaymentStatusNew"
        ELSE 'PENDING'::"PaymentStatusNew"
    END;--> statement-breakpoint

-- Drop old column and rename new column
ALTER TABLE "booking" DROP COLUMN "payment_status";--> statement-breakpoint
ALTER TABLE "booking" RENAME COLUMN "payment_status_new" TO "payment_status";--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING';--> statement-breakpoint

-- Drop old enum and rename new enum
DROP TYPE "public"."PaymentStatus";--> statement-breakpoint
ALTER TYPE "public"."PaymentStatusNew" RENAME TO "PaymentStatus";--> statement-breakpoint

-- ============================================================================
-- MIGRATION COMPLETE
-- Old pricing/payment columns on booking table are preserved for now.
-- They will be removed in a follow-up migration after verification.
-- 
-- Preserved columns (to remove in next migration):
-- - captain_fee, cleaning_fee, service_fee, tax_amount, discount_amount
-- - total_amount, deposit_amount, currency
-- - payment_method, deposit_paid, refund_amount, refund_status
-- - stripe_customer_id, stripe_payment_intent_id, stripe_payment_link_id
-- ============================================================================
