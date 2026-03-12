ALTER TABLE "proposal" ADD COLUMN "allow_payment" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "proposal" ADD COLUMN "payment_type" text DEFAULT 'FULL_PAYMENT';