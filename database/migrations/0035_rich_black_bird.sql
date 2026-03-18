ALTER TABLE "booking_ops" ADD COLUMN "gmv_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "paid_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "balance_client_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "ops_note" text;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "connected" boolean;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "client_paid" boolean;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "all_paid" boolean;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "sheets_sent" boolean;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "agent_code" text;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "commission_agent_cents" bigint;--> statement-breakpoint
ALTER TABLE "booking_ops" ADD COLUMN "commission_kos_cents" bigint;