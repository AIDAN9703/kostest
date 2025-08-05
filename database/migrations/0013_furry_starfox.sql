DROP TYPE "public"."PaymentStatus";--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('AWAITING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED', 'CHARGEBACK');--> statement-breakpoint
ALTER TABLE "public"."booking" ALTER COLUMN "payment_status" SET DATA TYPE "public"."PaymentStatus" USING "payment_status"::"public"."PaymentStatus";