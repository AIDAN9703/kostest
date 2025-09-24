CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"location" varchar(255),
	"yacht_name" varchar(255),
	"total_capacity" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ticket_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"max_quantity" integer NOT NULL,
	"sold_quantity" integer DEFAULT 0 NOT NULL,
	"sale_start_date" timestamp,
	"sale_end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_ticket_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"buyer_name" varchar(200) NOT NULL,
	"buyer_email" varchar(255) NOT NULL,
	"buyer_phone" varchar(20),
	"total_amount" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"tier_id" integer NOT NULL,
	"ticket_code" varchar(100) NOT NULL,
	"attendee_name" varchar(200),
	"is_checked_in" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_tickets_ticket_code_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
DROP TABLE "event" CASCADE;--> statement-breakpoint
DROP TABLE "event_ticket" CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ADD CONSTRAINT "event_ticket_purchases_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_purchase_id_event_ticket_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."event_ticket_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE no action ON UPDATE no action;