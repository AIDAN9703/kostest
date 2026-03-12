CREATE TABLE "booking_ops" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"duration_hours" numeric(6, 2),
	"expense_cents" bigint,
	"revenue_cents" bigint,
	"balance_owner_cents" bigint,
	"balance_client_cents" bigint,
	"crew_name" text,
	"contract_signed" boolean,
	"captain_paid" boolean,
	"agent_code" text,
	"commission_cents" bigint,
	"source_override" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_ops" ADD CONSTRAINT "booking_ops_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;