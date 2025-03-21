CREATE TYPE "public"."AuthProvider" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE');--> statement-breakpoint
CREATE TYPE "public"."BoatCategory" AS ENUM('PONTOON', 'YACHT', 'SAILBOAT', 'FISHING', 'SPEEDBOAT', 'HOUSEBOAT', 'JET_SKI', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."BoatingExperienceLevel" AS ENUM('NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL');--> statement-breakpoint
CREATE TYPE "public"."BoatingLicenseType" AS ENUM('NONE', 'STATE_BOATING_LICENSE', 'USCG_LICENSE', 'INTERNATIONAL_LICENSE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."BookingRequestStatus" AS ENUM('PENDING', 'APPROVED', 'AWAITING', 'CONFIRMED', 'DENIED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."LineItemType" AS ENUM('CLEANING', 'CAPTAIN', 'OWNER', 'BOOKING_FEE');--> statement-breakpoint
CREATE TYPE "public"."LocationType" AS ENUM('HOME_PORT', 'CURRENT_LOCATION', 'PICKUP_LOCATION', 'DROPOFF_LOCATION', 'DESTINATION');--> statement-breakpoint
CREATE TYPE "public"."NotificationPreference" AS ENUM('ALL', 'IMPORTANT_ONLY', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN', 'CAPTAIN', 'BROKER', 'OWNER');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."VerificationChannel" AS ENUM('SMS', 'CALL', 'EMAIL', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."VerificationStatus" AS ENUM('PENDING', 'PASSED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."VerificationType" AS ENUM('PHONE', 'EMAIL', 'IDENTITY', 'AGE', 'PAYMENT_METHOD');--> statement-breakpoint
CREATE TABLE "boat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_title" text,
	"description" text,
	"category" "BoatCategory" NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false,
	"featured_order" integer,
	"owner_id" uuid NOT NULL,
	"owner_email" text,
	"make" text,
	"model" text,
	"year_built" integer,
	"length_ft" integer NOT NULL,
	"capacity" integer NOT NULL,
	"cabins" integer,
	"bathrooms" integer,
	"showers" integer,
	"sleeps" integer,
	"beam" double precision,
	"draft" double precision,
	"weight" integer,
	"fuel_type" text,
	"engine_type" text,
	"engine_power" text,
	"max_speed" integer,
	"cruising_speed" integer,
	"range" integer,
	"features" text[] NOT NULL,
	"amenities" text[],
	"safety_equipment" text[],
	"main_image" text,
	"gallery_images" text[],
	"virtual_tour_url" text,
	"video_url" text,
	"hourly_rate" double precision NOT NULL,
	"half_day_price" double precision,
	"full_day_price" double precision,
	"weekly_rate" double precision,
	"monthly_rate" double precision,
	"deposit_amount" double precision,
	"cleaning_fee" double precision,
	"tax_rate" double precision,
	"seasonal_rates" json,
	"home_port" text,
	"current_location" text,
	"location" geometry(point),
	"available_destinations" text[],
	"dock_info" text,
	"parking_info" text,
	"crew_required" boolean DEFAULT true NOT NULL,
	"crew_included" boolean DEFAULT true NOT NULL,
	"crew_size" integer,
	"primary_captain_id" uuid,
	"day_charter" boolean DEFAULT true NOT NULL,
	"term_charter" boolean DEFAULT false NOT NULL,
	"minimum_charter_days" integer,
	"fuel_included" boolean DEFAULT false NOT NULL,
	"fuel_capacity" integer,
	"water_capacity" integer,
	"rules" text,
	"special_instructions" text,
	"cancellation_policy" text,
	"registration_number" text,
	"hull_id" text,
	"insurance_info" text,
	"insurance_expiry" timestamp,
	"available_weekdays" text[],
	"min_rental_hours" integer,
	"max_rental_days" integer,
	"advance_booking_days" integer,
	"seasonal_availability" json,
	"last_maintenance_date" timestamp,
	"next_maintenance_date" timestamp,
	"maintenance_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"user_id" uuid,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"is_multi_day" boolean NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"number_of_hours" integer,
	"number_of_passengers" integer NOT NULL,
	"special_requests" text,
	"occasion_type" text,
	"needs_captain" boolean DEFAULT false,
	"total_amount" double precision NOT NULL,
	"deposit_amount" double precision,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_due_date" timestamp,
	"status" "BookingRequestStatus" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"stripe_payment_link_id" text,
	"stripe_payment_link_url" text,
	"stripe_payment_link_expires_at" timestamp,
	"stripe_payment_intent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
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
	"pickup_coordinates" geometry(point),
	"dropoff_location" text,
	"dropoff_coordinates" geometry(point),
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
CREATE TABLE "captain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'PENDING',
	"description" text,
	"hire_rate" double precision,
	"available_for_hire" boolean DEFAULT false,
	"street" text,
	"street_second" text,
	"city" text,
	"state" text,
	"zip" text,
	"uscg_licensed" boolean DEFAULT false NOT NULL,
	"license_type" text,
	"license_number" text,
	"license_expiry" timestamp,
	"license_image" text,
	"years_experience" integer,
	"specialties" text[],
	"languages" text[],
	"certifications" text[],
	"resume" text,
	"availability" json,
	"preferred_boat_types" text[],
	"preferred_locations" text[],
	"max_passengers" integer,
	"academy_qualified" boolean DEFAULT false,
	"academy_status" text,
	"training_completed" text[],
	"agreement_signed" boolean DEFAULT false,
	"agreement_date" timestamp,
	"agreement_type" text,
	"total_trips" integer DEFAULT 0,
	"average_rating" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "captain_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"twilio_sid" text,
	"twilio_status" text,
	"related_id" uuid,
	"related_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"metadata" json
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
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"first_name" text,
	"last_name" text,
	"display_name" text,
	"phone_number" text,
	"birthday" timestamp,
	"bio" text,
	"profile_image" text,
	"cover_image" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" text,
	"auth_provider" "AuthProvider" DEFAULT 'EMAIL',
	"provider_account_id" text,
	"last_login_at" timestamp with time zone,
	"last_login_ip" text,
	"last_login_device" text,
	"failed_login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp with time zone,
	"password_changed_at" timestamp with time zone,
	"reset_password_token" text,
	"reset_password_expires" timestamp,
	"force_password_change" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"currency" text DEFAULT 'USD',
	"theme" text DEFAULT 'light',
	"email_notifications" "NotificationPreference" DEFAULT 'ALL',
	"push_notifications" "NotificationPreference" DEFAULT 'ALL',
	"sms_notifications" "NotificationPreference" DEFAULT 'IMPORTANT_ONLY',
	"marketing_emails_enabled" boolean DEFAULT true NOT NULL,
	"country" text,
	"state" text,
	"city" text,
	"address" text,
	"postal_code" text,
	"identity_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_token_expires" timestamp,
	"government_id_verified" boolean DEFAULT false,
	"government_id_type" text,
	"government_id_expiry" timestamp,
	"background_check_status" text,
	"background_check_date" timestamp,
	"boating_experience" "BoatingExperienceLevel" DEFAULT 'NONE',
	"boating_license_type" "BoatingLicenseType" DEFAULT 'NONE',
	"boating_license_number" text,
	"boating_license_expiry" timestamp,
	"boating_license_verified" boolean DEFAULT false,
	"boating_certifications" text[],
	"has_insurance" boolean DEFAULT false,
	"insurance_provider" text,
	"insurance_policy_number" text,
	"insurance_expiry_date" timestamp,
	"insurance_verified" boolean DEFAULT false,
	"stripe_customer_id" text,
	"default_payment_method_id" text,
	"has_bank_account_connected" boolean DEFAULT false,
	"stripe_connect_account_id" text,
	"payout_preference" text DEFAULT 'AUTOMATIC',
	"is_boat_owner" boolean DEFAULT false,
	"owner_onboarding_complete" boolean DEFAULT false,
	"owner_verification_status" text,
	"total_boats_listed" integer DEFAULT 0,
	"preferred_rental_types" text[],
	"preferred_boat_types" text[],
	"preferred_destinations" text[],
	"rental_history" json,
	"terms_accepted_at" timestamp with time zone,
	"privacy_policy_accepted_at" timestamp with time zone,
	"accepted_anchor_code" boolean DEFAULT false NOT NULL,
	"rental_agreement_accepted_at" timestamp with time zone,
	"liability_waiver_accepted_at" timestamp with time zone,
	"signup_complete" boolean DEFAULT false NOT NULL,
	"onboarding_step" integer DEFAULT 1,
	"profile_completion_percentage" integer DEFAULT 0,
	"last_active_at" timestamp with time zone,
	"total_bookings" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"average_rating" double precision,
	"total_trips_as_renter" integer DEFAULT 0,
	"total_trips_as_owner" integer DEFAULT 0,
	"cancellation_rate" double precision DEFAULT 0,
	"response_rate" double precision DEFAULT 0,
	"response_time" integer,
	"referral_code" text,
	"referred_by_id" uuid,
	"total_referrals" integer DEFAULT 0,
	"referral_credits" double precision DEFAULT 0,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deletion_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "VerificationType" NOT NULL,
	"channel" "VerificationChannel" NOT NULL,
	"status" "VerificationStatus" DEFAULT 'PENDING' NOT NULL,
	"phone_number" text,
	"email" text,
	"code" text NOT NULL,
	"code_hash" text,
	"twilio_sid" text,
	"twilio_status" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"ip_address" text,
	"user_agent" text,
	"metadata" json
);
--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_primary_captain_id_captain_id_fk" FOREIGN KEY ("primary_captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_renter_id_user_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_captain_id_captain_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captain" ADD CONSTRAINT "captain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_user_id_user_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_boat_id_boat_id_fk" FOREIGN KEY ("reviewed_boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_captain_id_captain_id_fk" FOREIGN KEY ("reviewed_captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_owner_idx" ON "boat" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "boat_captain_idx" ON "boat" USING btree ("primary_captain_id");--> statement-breakpoint
CREATE INDEX "boat_category_idx" ON "boat" USING btree ("category");--> statement-breakpoint
CREATE INDEX "boat_location_idx" ON "boat" USING btree ("home_port");--> statement-breakpoint
CREATE INDEX "boat_spatial_idx" ON "boat" USING gist ("location");--> statement-breakpoint
CREATE INDEX "booking_requests_boat_id_idx" ON "booking_requests" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "booking_requests_user_id_idx" ON "booking_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_requests_status_idx" ON "booking_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_requests_date_range_idx" ON "booking_requests" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_renter_idx" ON "booking" USING btree ("renter_id");--> statement-breakpoint
CREATE INDEX "booking_boat_idx" ON "booking" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "booking_date_idx" ON "booking" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "booking_pickup_idx" ON "booking" USING gist ("pickup_coordinates");--> statement-breakpoint
CREATE INDEX "booking_dropoff_idx" ON "booking" USING gist ("dropoff_coordinates");--> statement-breakpoint
CREATE INDEX "captain_status_idx" ON "captain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "captain_location_idx" ON "captain" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "captain_license_idx" ON "captain" USING btree ("license_type");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_related_idx" ON "notification" USING btree ("related_id","related_type");--> statement-breakpoint
CREATE INDEX "review_type_idx" ON "review" USING btree ("type");--> statement-breakpoint
CREATE INDEX "review_booking_idx" ON "review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "review_reviewer_idx" ON "review" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "review_boat_idx" ON "review" USING btree ("reviewed_boat_id");--> statement-breakpoint
CREATE INDEX "review_captain_idx" ON "review" USING btree ("reviewed_captain_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("reviewed_user_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "boating_exp_idx" ON "user" USING btree ("boating_experience");--> statement-breakpoint
CREATE INDEX "referral_code_idx" ON "user" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "referred_by_idx" ON "user" USING btree ("referred_by_id");--> statement-breakpoint
CREATE INDEX "verification_user_idx" ON "verification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_status_idx" ON "verification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "verification_type_idx" ON "verification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verification" USING btree ("expires_at");