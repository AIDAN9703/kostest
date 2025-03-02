CREATE TYPE "public"."AuthProvider" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE');--> statement-breakpoint
CREATE TYPE "public"."BoatingExperienceLevel" AS ENUM('NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL');--> statement-breakpoint
CREATE TYPE "public"."BoatingLicenseType" AS ENUM('NONE', 'STATE_BOATING_LICENSE', 'USCG_LICENSE', 'INTERNATIONAL_LICENSE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."NotificationPreference" AS ENUM('ALL', 'IMPORTANT_ONLY', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BANNED');--> statement-breakpoint
ALTER TYPE "public"."UserRole" ADD VALUE 'OWNER';--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"type" text NOT NULL,
	"renter_id" uuid NOT NULL,
	"boat_id" uuid NOT NULL,
	"captain_id" uuid,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"passengers" integer NOT NULL,
	"pickup_location" text,
	"dropoff_location" text,
	"destination_details" text,
	"base_price" double precision NOT NULL,
	"captain_fee" double precision,
	"cleaning_fee" double precision,
	"service_fee" double precision NOT NULL,
	"tax_amount" double precision,
	"total_price" double precision NOT NULL,
	"payment_status" text DEFAULT 'PENDING',
	"payment_method" text,
	"payment_intent_id" text,
	"deposit_amount" double precision,
	"deposit_paid" boolean DEFAULT false,
	"refund_amount" double precision,
	"special_requests" text,
	"add_ons" json,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"cancelled_by" uuid,
	"refund_status" text,
	"message_thread_id" uuid,
	"last_message_at" timestamp with time zone,
	"renter_review_id" uuid,
	"owner_review_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"booking_id" uuid,
	"reviewer_id" uuid NOT NULL,
	"reviewed_user_id" uuid,
	"reviewed_boat_id" uuid,
	"reviewed_captain_id" uuid,
	"rating" integer NOT NULL,
	"title" text,
	"content" text,
	"response" text,
	"response_date" timestamp with time zone,
	"photos" text[],
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_reported" boolean DEFAULT false,
	"report_reason" text,
	"helpful_count" integer DEFAULT 0,
	"unhelpful_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat" ALTER COLUMN "term_charter" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "captain" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "captain" ALTER COLUMN "academy_qualified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "status" SET DATA TYPE UserStatus;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "capacity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "cabins" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "bathrooms" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "showers" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "sleeps" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "weight" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "fuel_type" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "engine_type" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "engine_power" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "amenities" text[];--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "safety_equipment" text[];--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "main_image" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "gallery_images" text[];--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "cleaning_fee" double precision;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "tax_rate" double precision;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "parking_info" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "crew_size" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "rules" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "cancellation_policy" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "insurance_info" text;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "insurance_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "available_weekdays" text[];--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "min_rental_hours" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "max_rental_days" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "advance_booking_days" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "seasonal_availability" json;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "maintenance_notes" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "available_for_hire" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "license_number" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "license_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "license_image" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "years_experience" integer;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "specialties" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "languages" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "certifications" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "resume" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "preferred_boat_types" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "preferred_locations" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "max_passengers" integer;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "academy_status" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "training_completed" text[];--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "agreement_signed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "agreement_date" timestamp;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "agreement_type" text;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "total_trips" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "captain" ADD COLUMN "average_rating" double precision;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_image" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "auth_provider" "AuthProvider" DEFAULT 'EMAIL';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "provider_account_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_ip" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_device" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "theme" text DEFAULT 'light';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_notifications" "NotificationPreference" DEFAULT 'ALL';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "push_notifications" "NotificationPreference" DEFAULT 'ALL';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sms_notifications" "NotificationPreference" DEFAULT 'IMPORTANT_ONLY';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "identity_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "verification_token_expires" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "government_id_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "government_id_type" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "government_id_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "background_check_status" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "background_check_date" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_experience" "BoatingExperienceLevel" DEFAULT 'NONE';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_license_type" "BoatingLicenseType" DEFAULT 'NONE';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_license_number" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_license_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_license_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "boating_certifications" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "has_insurance" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "insurance_provider" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "insurance_policy_number" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "insurance_expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "insurance_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "default_payment_method_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "has_bank_account_connected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_connect_account_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "payout_preference" text DEFAULT 'AUTOMATIC';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_boat_owner" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "owner_onboarding_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "owner_verification_status" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_boats_listed" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_rental_types" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_boat_types" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_destinations" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rental_history" json;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rental_agreement_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "liability_waiver_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_step" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_completion_percentage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_bookings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "average_rating" double precision;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_trips_as_renter" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_trips_as_owner" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cancellation_rate" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "response_rate" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "response_time" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referred_by_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_referrals" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_credits" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_renter_id_user_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_captain_id_captain_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_user_id_user_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_boat_id_boat_id_fk" FOREIGN KEY ("reviewed_boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_captain_id_captain_id_fk" FOREIGN KEY ("reviewed_captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_renter_idx" ON "booking" USING btree ("renter_id");--> statement-breakpoint
CREATE INDEX "booking_boat_idx" ON "booking" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "booking_date_idx" ON "booking" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "review_type_idx" ON "review" USING btree ("type");--> statement-breakpoint
CREATE INDEX "review_booking_idx" ON "review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "review_reviewer_idx" ON "review" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "review_boat_idx" ON "review" USING btree ("reviewed_boat_id");--> statement-breakpoint
CREATE INDEX "review_captain_idx" ON "review" USING btree ("reviewed_captain_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("reviewed_user_id");--> statement-breakpoint
CREATE INDEX "boat_location_idx" ON "boat" USING btree ("home_port");--> statement-breakpoint
CREATE INDEX "captain_status_idx" ON "captain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "captain_location_idx" ON "captain" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "captain_license_idx" ON "captain" USING btree ("license_type");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "boating_exp_idx" ON "user" USING btree ("boating_experience");--> statement-breakpoint
CREATE INDEX "referral_code_idx" ON "user" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "referred_by_idx" ON "user" USING btree ("referred_by_id");--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "num_of_passengers";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "num_of_cabins";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "num_of_bathrooms";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "num_of_showers";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "sleeps_num";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "gross_tonnage";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "parking_notes";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "instructions_and_rules";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "primary_photo";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "primary_photo_abs_path";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "gallery_photos";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "youtube_link";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "additional_hours";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "cash_value";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "seasonal_locations";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "list_boat";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "crew_num";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "preferred_charter_duration";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "fuel_billing_rate";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "fuel_reimbursement_rate";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "fuel_payee_type";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "flag_state";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "classification_society";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "insurance_photo";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "insurance_photo_abs_path";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "insurance_expiry_date";--> statement-breakpoint
ALTER TABLE "boat" DROP COLUMN "last_survey_date";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "uscg_license_number";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "license_exp_date";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "captain_for_hire";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "anchor_academy";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "list_boat";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "previous_experience";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "resume_url";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "license_url";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "license_key";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "primary_crew_id";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "ica_signature";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "ica_type";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "ica_date";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "academy_status_id";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "drug_info_id";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "personal_info_id";--> statement-breakpoint
ALTER TABLE "captain" DROP COLUMN "preferred_vessels";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "profile_abs_path";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_notifications_enabled";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "phone_confirmed";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_verified";