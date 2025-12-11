ALTER TABLE "boat" DROP CONSTRAINT "boat_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "boat" DROP CONSTRAINT "boat_primary_captain_id_captain_id_fk";
--> statement-breakpoint
ALTER TABLE "captain" DROP CONSTRAINT "captain_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_boat_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_boat_id_boat_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_captain_id_captain_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_pricing_tier_id_boat_pricing_tier_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_reviewed_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_assigned_admin_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booking" DROP CONSTRAINT "booking_cancelled_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_booking_id_booking_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_reviewer_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_reviewed_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_reviewed_boat_id_boat_id_fk";
--> statement-breakpoint
ALTER TABLE "review" DROP CONSTRAINT "review_reviewed_captain_id_captain_id_fk";
--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "general_inquiry" DROP CONSTRAINT "general_inquiry_assigned_to_user_id_fk";
--> statement-breakpoint
ALTER TABLE "boat_google_calendars" DROP CONSTRAINT "boat_google_calendars_owner_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" DROP CONSTRAINT "external_google_calendar_sync_events_booking_id_booking_id_fk";
--> statement-breakpoint
ALTER TABLE "event_tickets" DROP CONSTRAINT IF EXISTS "event_tickets_purchase_id_event_ticket_purchases_id_fk";
--> statement-breakpoint
ALTER TABLE "event_tickets" DROP CONSTRAINT "event_tickets_tier_id_ticket_tiers_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket_tiers" DROP CONSTRAINT "ticket_tiers_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" DROP CONSTRAINT "event_ticket_purchases_event_id_events_id_fk";
--> statement-breakpoint
DELETE FROM "event_tickets";--> statement-breakpoint
DELETE FROM "event_ticket_purchases";--> statement-breakpoint
DELETE FROM "ticket_tiers";--> statement-breakpoint
DELETE FROM "events";--> statement-breakpoint
ALTER TABLE "boat" ALTER COLUMN "insurance_expiry" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boat" ALTER COLUMN "last_maintenance_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boat" ALTER COLUMN "next_maintenance_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "birthday" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "reset_password_expires" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "insurance_expiry_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "captain" ALTER COLUMN "license_expiry" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "captain" ALTER COLUMN "agreement_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "payment_due_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "reviewed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "general_inquiry" ALTER COLUMN "date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "start_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "end_time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "event_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "sale_start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "sale_end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ALTER COLUMN "event_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "purchase_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "tier_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "checked_in_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_tickets" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_primary_captain_id_captain_id_fk" FOREIGN KEY ("primary_captain_id") REFERENCES "public"."captain"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captain" ADD CONSTRAINT "captain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_owner_id_user_id_fk" FOREIGN KEY ("boat_owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_captain_id_captain_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."captain"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_assigned_admin_id_user_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_user_id_user_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_boat_id_boat_id_fk" FOREIGN KEY ("reviewed_boat_id") REFERENCES "public"."boat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_captain_id_captain_id_fk" FOREIGN KEY ("reviewed_captain_id") REFERENCES "public"."captain"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_inquiry" ADD CONSTRAINT "general_inquiry_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_blocking" ADD CONSTRAINT "boat_blocking_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_google_calendars" ADD CONSTRAINT "boat_google_calendars_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket_purchases" ADD CONSTRAINT "event_ticket_purchases_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_purchase_id_event_ticket_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."event_ticket_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_blocking_created_by_idx" ON "boat_blocking" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_active_idx" ON "events" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "ticket_tiers_event_idx" ON "ticket_tiers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "ticket_tiers_active_idx" ON "ticket_tiers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "event_ticket_purchases_event_idx" ON "event_ticket_purchases" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_ticket_purchases_email_idx" ON "event_ticket_purchases" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX "event_tickets_purchase_idx" ON "event_tickets" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "event_tickets_tier_idx" ON "event_tickets" USING btree ("tier_id");--> statement-breakpoint
CREATE INDEX "event_tickets_code_idx" ON "event_tickets" USING btree ("ticket_code");