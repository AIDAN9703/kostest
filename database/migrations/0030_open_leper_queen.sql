CREATE TABLE "booking_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"actor_type" text DEFAULT 'system' NOT NULL,
	"actor_id" uuid,
	"event_type" text NOT NULL,
	"channel" text,
	"previous_state" jsonb,
	"new_state" jsonb,
	"display_message" text,
	"content" text,
	"contact_method" "ContactMethod",
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_event" ADD CONSTRAINT "booking_event_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_event" ADD CONSTRAINT "booking_event_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_event_booking_idx" ON "booking_event" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_event_created_idx" ON "booking_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "booking_event_type_idx" ON "booking_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "booking_event_actor_idx" ON "booking_event" USING btree ("actor_id");