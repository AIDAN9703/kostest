ALTER TABLE "inquiry" DROP CONSTRAINT "inquiry_converted_booking_id_booking_id_fk";
--> statement-breakpoint
ALTER TABLE "inquiry" ADD COLUMN "currency" text DEFAULT 'USD';