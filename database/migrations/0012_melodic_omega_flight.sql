ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."BookingStatus";--> statement-breakpoint
CREATE TYPE "public"."BookingStatus" AS ENUM('PENDING', 'APPROVED', 'CONFIRMED', 'DENIED', 'EXPIRED', 'CANCELLED', 'COMPLETED', 'REFUNDED');--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "booking_status" SET DATA TYPE "public"."BookingStatus" USING "booking_status"::"public"."BookingStatus";