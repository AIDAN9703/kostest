ALTER TABLE "booking" DROP CONSTRAINT "booking_reviewed_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "captain_fee";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "cleaning_fee";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "service_fee";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "tax_amount";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "discount_amount";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "deposit_amount";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "payment_status";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "payment_method";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "deposit_paid";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "refund_amount";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "refund_status";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "stripe_payment_intent_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "stripe_payment_link_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "reviewed_by";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "reviewed_at";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "review_notes";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "contacted_at";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "payment_due_date";