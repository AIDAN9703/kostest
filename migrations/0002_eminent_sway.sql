CREATE TABLE "boat_pricing_tier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"hours" integer NOT NULL,
	"price" double precision NOT NULL,
	"name" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boat_pricing_unique_idx" UNIQUE("boat_id","hours")
);
--> statement-breakpoint
CREATE TABLE "general_inquiry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"date" timestamp,
	"time" text,
	"budget" text,
	"guests" integer,
	"message" text,
	"assigned_to" uuid,
	"notes" text,
	"terms_accepted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"contacted_at" timestamp with time zone,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
DROP INDEX "boat_location_idx";--> statement-breakpoint
DROP INDEX "booking_pickup_idx";--> statement-breakpoint
DROP INDEX "booking_dropoff_idx";--> statement-breakpoint
DROP INDEX "referral_code_idx";--> statement-breakpoint
DROP INDEX "referred_by_idx";--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "owner_notes" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "location_label" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "pricing_tier_id" uuid;--> statement-breakpoint
ALTER TABLE "boat_pricing_tier" ADD CONSTRAINT "boat_pricing_tier_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_inquiry" ADD CONSTRAINT "general_inquiry_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_pricing_boat_idx" ON "boat_pricing_tier" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_pricing_hours_idx" ON "boat_pricing_tier" USING btree ("hours");--> statement-breakpoint
CREATE INDEX "inquiry_status_idx" ON "general_inquiry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiry_email_idx" ON "general_inquiry" USING btree ("email");--> statement-breakpoint
CREATE INDEX "inquiry_date_idx" ON "general_inquiry" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "featured_order";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "owner_email";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "cabins";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "beam";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "draft";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "fuel_type";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "engine_type";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "engine_power";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "max_speed";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "cruising_speed";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "amenities";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "video_url";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "hourly_rate";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "half_day_price";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "full_day_price";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "tax_rate";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "seasonal_rates";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "home_port";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "current_location";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "crew_size";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "fuel_capacity";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "available_weekdays";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "seasonal_availability";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "number_of_hours";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "pickup_coordinates";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "dropoff_coordinates";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "destination_details";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "stripe_payment_link_url";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "stripe_payment_link_expires_at";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "message_thread_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "last_message_at";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "renter_review_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "owner_review_id";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "booking" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "academy_qualified";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "academy_status";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "training_completed";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_login_ip";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_login_device";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "theme";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "push_notifications";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "verification_token";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "verification_token_expires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "government_id_expiry";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "background_check_status";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "background_check_date";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_license_type";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_certifications";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "owner_verification_status";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "preferred_boat_types";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "preferred_destinations";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "rental_history";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "accepted_anchor_code";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "rental_agreement_accepted_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "liability_waiver_accepted_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "signup_complete";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "onboarding_step";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "profile_completion_percentage";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_active_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_trips_as_renter";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_trips_as_owner";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "referral_code";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "referred_by_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_referrals";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "referral_credits";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "deletion_reason";--> statement-breakpoint
DROP TYPE "public"."BoatingLicenseType";