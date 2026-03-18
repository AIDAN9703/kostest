-- Step 1: Drop defaults that depend on the enum, then convert columns to text
ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."booking_status_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."booking_status_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Migrate data — set cancellation_reason for bookings being moved to CANCELLED
UPDATE "public"."booking"
  SET booking_status = 'CANCELLED',
      cancellation_reason = COALESCE(cancellation_reason, 'Request denied'),
      cancelled_at = COALESCE(cancelled_at, NOW())
  WHERE booking_status = 'DENIED';--> statement-breakpoint

UPDATE "public"."booking"
  SET booking_status = 'CANCELLED',
      cancellation_reason = COALESCE(cancellation_reason, 'Booking expired'),
      cancelled_at = COALESCE(cancelled_at, NOW())
  WHERE booking_status = 'EXPIRED';--> statement-breakpoint

UPDATE "public"."booking"
  SET booking_status = 'CANCELLED',
      cancellation_reason = COALESCE(cancellation_reason, 'Payment refunded'),
      cancelled_at = COALESCE(cancelled_at, NOW())
  WHERE booking_status = 'REFUNDED';--> statement-breakpoint

-- Step 3: Migrate history records (preserve audit trail but remap values)
UPDATE "public"."booking_status_history"
  SET from_status = 'CANCELLED' WHERE from_status IN ('DENIED', 'EXPIRED', 'REFUNDED');--> statement-breakpoint
UPDATE "public"."booking_status_history"
  SET to_status = 'CANCELLED' WHERE to_status IN ('DENIED', 'EXPIRED', 'REFUNDED');--> statement-breakpoint

-- Step 4: Drop old enum and create new one
DROP TYPE "public"."BookingStatus";--> statement-breakpoint
CREATE TYPE "public"."BookingStatus" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint

-- Step 5: Cast columns back to the new enum and restore default
ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" SET DATA TYPE "public"."BookingStatus" USING "booking_status"::"public"."BookingStatus";--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" SET DEFAULT 'PENDING'::"public"."BookingStatus";--> statement-breakpoint
ALTER TABLE "public"."booking_status_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."BookingStatus" USING "from_status"::"public"."BookingStatus";--> statement-breakpoint
ALTER TABLE "public"."booking_status_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."BookingStatus" USING "to_status"::"public"."BookingStatus";
