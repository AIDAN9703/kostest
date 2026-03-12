CREATE TYPE "public"."AuthProvider" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE');--> statement-breakpoint
CREATE TYPE "public"."VerificationChannel" AS ENUM('SMS', 'CALL', 'EMAIL', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."VerificationStatus" AS ENUM('PENDING', 'PASSED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."VerificationType" AS ENUM('PHONE', 'EMAIL', 'IDENTITY', 'AGE', 'PAYMENT_METHOD');--> statement-breakpoint
CREATE TYPE "public"."PostCategory" AS ENUM('FLEET_NEWS', 'CONSERVATION', 'TIPS_ADVICE', 'CASE_STUDY', 'COMPANY_NEWS', 'SAFETY', 'EVENTS');--> statement-breakpoint
CREATE TYPE "public"."PostStatus" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."BookingStatus" AS ENUM('PENDING', 'APPROVED', 'CONFIRMED', 'DENIED', 'EXPIRED', 'CANCELLED', 'COMPLETED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."BookingType" AS ENUM('REQUEST', 'INSTANT_BOOK', 'EXTERNAL_BOOKING');--> statement-breakpoint
CREATE TYPE "public"."BoatCategory" AS ENUM('PONTOON', 'YACHT', 'SAILBOAT', 'FISHING', 'SPEEDBOAT', 'HOUSEBOAT', 'JET_SKI', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."BoatingExperienceLevel" AS ENUM('NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL');--> statement-breakpoint
CREATE TYPE "public"."LocationType" AS ENUM('HOME_PORT', 'CURRENT_LOCATION', 'PICKUP_LOCATION', 'DROPOFF_LOCATION', 'DESTINATION');--> statement-breakpoint
CREATE TYPE "public"."timezone" AS ENUM('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'America/Nassau', 'America/Jamaica', 'America/Santo_Domingo', 'America/Barbados', 'America/Cancun', 'America/Toronto', 'America/Vancouver');--> statement-breakpoint
CREATE TYPE "public"."ConversationStatus" AS ENUM('ACTIVE', 'ARCHIVED', 'CLOSED', 'SYSTEM_CLOSED');--> statement-breakpoint
CREATE TYPE "public"."ConversationType" AS ENUM('BOOKING', 'GENERAL', 'SUPPORT', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."MessageStatus" AS ENUM('SENT', 'DELIVERED', 'READ', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."MessageType" AS ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'SYSTEM', 'BOOKING_UPDATE', 'PAYMENT_UPDATE');--> statement-breakpoint
CREATE TYPE "public"."NotificationPreference" AS ENUM('ALL', 'IMPORTANT_ONLY', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."LineItemType" AS ENUM('CLEANING', 'CAPTAIN', 'VESSEL_FEE', 'BOOKING_FEE', 'TAX', 'TRANSACTION_FEE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('AWAITING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED', 'CHARGEBACK');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN', 'CAPTAIN', 'BROKER', 'OWNER');--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."BlockingType" AS ENUM('MAINTENANCE', 'OWNER_USE', 'WEATHER', 'ADMIN_BLOCK', 'HOLIDAY', 'SEASONAL', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."CalendarOwnerType" AS ENUM('ADMIN', 'OWNER');--> statement-breakpoint
CREATE TYPE "public"."CalendarSource" AS ENUM('GOOGLE', 'MANUAL', 'BOOKING');--> statement-breakpoint
CREATE TYPE "public"."CalendarSyncStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TABLE "boat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_title" text,
	"description" text,
	"category" "BoatCategory" NOT NULL,
	"capacity" integer NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false,
	"featured_order" integer,
	"search_ranking_score" double precision DEFAULT 0,
	"owner_id" uuid NOT NULL,
	"owner_notes" text,
	"make" text,
	"model" text,
	"year_built" integer,
	"length_ft" integer NOT NULL,
	"bathrooms" integer,
	"showers" integer,
	"sleeps" integer,
	"range" integer,
	"features" text[] NOT NULL,
	"safety_equipment" text[],
	"main_image" text,
	"gallery_images" text[],
	"virtual_tour_url" text,
	"weekly_rate" double precision,
	"monthly_rate" double precision,
	"deposit_amount" double precision,
	"cleaning_fee" double precision,
	"location_label" text,
	"location" geometry(point),
	"timezone" timezone,
	"available_destinations" text[],
	"dock_info" text,
	"parking_info" text,
	"crew_required" boolean DEFAULT true NOT NULL,
	"crew_included" boolean DEFAULT true NOT NULL,
	"primary_captain_id" uuid,
	"day_charter" boolean DEFAULT true NOT NULL,
	"term_charter" boolean DEFAULT false NOT NULL,
	"minimum_charter_days" integer,
	"instant_book" boolean DEFAULT false NOT NULL,
	"fuel_included" boolean DEFAULT false NOT NULL,
	"rules" text,
	"special_instructions" text,
	"cancellation_policy" text,
	"registration_number" text,
	"hull_id" text,
	"insurance_info" text,
	"insurance_expiry" timestamp,
	"min_rental_hours" integer,
	"max_rental_days" integer,
	"advance_booking_days" integer,
	"last_maintenance_date" timestamp,
	"next_maintenance_date" timestamp,
	"maintenance_notes" text,
	"average_rating" double precision,
	"total_reviews" integer DEFAULT 0,
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
	"failed_login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp with time zone,
	"password_changed_at" timestamp with time zone,
	"reset_password_token" text,
	"reset_password_expires" timestamp,
	"force_password_change" boolean DEFAULT false NOT NULL,
	"email_notifications" "NotificationPreference" DEFAULT 'ALL',
	"sms_notifications" "NotificationPreference" DEFAULT 'IMPORTANT_ONLY',
	"marketing_emails_enabled" boolean DEFAULT true NOT NULL,
	"country" text,
	"state" text,
	"city" text,
	"address" text,
	"postal_code" text,
	"identity_verified" boolean DEFAULT false,
	"government_id_verified" boolean DEFAULT false,
	"government_id_type" text,
	"boating_experience" "BoatingExperienceLevel" DEFAULT 'NONE',
	"boating_license_number" text,
	"boating_license_expiry" timestamp,
	"boating_license_verified" boolean DEFAULT false,
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
	"total_boats_listed" integer DEFAULT 0,
	"preferred_rental_types" text[],
	"terms_accepted_at" timestamp with time zone,
	"privacy_policy_accepted_at" timestamp with time zone,
	"total_bookings" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"average_rating" double precision,
	"cancellation_rate" double precision DEFAULT 0,
	"response_rate" double precision DEFAULT 0,
	"response_time" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
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
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_type" "BookingType" DEFAULT 'EXTERNAL_BOOKING' NOT NULL,
	"booking_status" "BookingStatus" DEFAULT 'PENDING' NOT NULL,
	"user_id" uuid,
	"boat_owner_id" uuid,
	"boat_id" uuid NOT NULL,
	"captain_id" uuid,
	"pricing_tier_id" uuid,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"is_multi_day" boolean NOT NULL,
	"needs_captain" boolean DEFAULT false,
	"start_datetime" timestamp with time zone NOT NULL,
	"end_datetime" timestamp with time zone,
	"number_of_passengers" integer NOT NULL,
	"pickup_location" text,
	"dropoff_location" text,
	"captain_fee" double precision,
	"cleaning_fee" double precision,
	"service_fee" double precision,
	"tax_amount" double precision,
	"discount_amount" double precision DEFAULT 0,
	"total_amount" double precision NOT NULL,
	"deposit_amount" double precision,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_status" "PaymentStatus" DEFAULT 'AWAITING_PAYMENT',
	"payment_method" text,
	"payment_due_date" timestamp,
	"deposit_paid" boolean DEFAULT false,
	"refund_amount" double precision,
	"refund_status" text,
	"stripe_customer_id" text,
	"stripe_payment_intent_id" text,
	"stripe_payment_link_id" text,
	"special_requests" text,
	"occasion_type" text,
	"add_ons" json,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"cancelled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp
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
CREATE TABLE "blog_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"status" "PostStatus" DEFAULT 'DRAFT' NOT NULL,
	"category" "PostCategory" NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_image" text,
	"image_alt" text,
	"meta_title" text,
	"meta_description" text,
	"author" text DEFAULT 'KOS Team' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
CREATE TABLE "boat_blocking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"blocking_type" "BlockingType" NOT NULL,
	"reason" text,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "ConversationType" DEFAULT 'BOOKING' NOT NULL,
	"status" "ConversationStatus" DEFAULT 'ACTIVE' NOT NULL,
	"booking_id" uuid,
	"initiated_by" uuid NOT NULL,
	"participant_ids" uuid[] NOT NULL,
	"subject" text,
	"last_message_id" uuid,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"auto_close_at" timestamp with time zone,
	"assigned_admin" uuid,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"tags" text[],
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_by" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"message_type" "MessageType" DEFAULT 'TEXT' NOT NULL,
	"attachments" json,
	"status" "MessageStatus" DEFAULT 'SENT' NOT NULL,
	"read_by" json DEFAULT '{}' NOT NULL,
	"read_count" integer DEFAULT 0 NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"system_message_data" json,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"flagged_by" uuid,
	"flagged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"role" text DEFAULT 'PARTICIPANT' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"custom_name" text,
	"last_read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_message_id" uuid,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_participant_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "boat_google_calendars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"calendar_id" text NOT NULL,
	"calendar_name" text NOT NULL,
	"owner_type" "CalendarOwnerType" NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_sync_status" "CalendarSyncStatus",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_google_calendar_sync_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boat_id" uuid NOT NULL,
	"boat_calendar_id" uuid NOT NULL,
	"event_id" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"source" "CalendarSource" NOT NULL,
	"booking_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"banner_image" text,
	"cta_text" text DEFAULT 'Buy Tickets',
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"timezone" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"max_capacity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique_idx" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"purchaser_email" text NOT NULL,
	"purchaser_name" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"amount_paid" integer,
	"status" text DEFAULT 'PAID' NOT NULL,
	"confirmation_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat" ADD CONSTRAINT "boat_primary_captain_id_captain_id_fk" FOREIGN KEY ("primary_captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captain" ADD CONSTRAINT "captain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_owner_id_user_id_fk" FOREIGN KEY ("boat_owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_captain_id_captain_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_user_id_user_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_boat_id_boat_id_fk" FOREIGN KEY ("reviewed_boat_id") REFERENCES "public"."boat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewed_captain_id_captain_id_fk" FOREIGN KEY ("reviewed_captain_id") REFERENCES "public"."captain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_inquiry" ADD CONSTRAINT "general_inquiry_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_pricing_tier" ADD CONSTRAINT "boat_pricing_tier_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_blocking" ADD CONSTRAINT "boat_blocking_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_initiated_by_user_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_assigned_admin_user_id_fk" FOREIGN KEY ("assigned_admin") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_flagged_by_user_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_google_calendars" ADD CONSTRAINT "boat_google_calendars_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boat_google_calendars" ADD CONSTRAINT "boat_google_calendars_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_boat_calendar_id_boat_google_calendars_id_fk" FOREIGN KEY ("boat_calendar_id") REFERENCES "public"."boat_google_calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_google_calendar_sync_events" ADD CONSTRAINT "external_google_calendar_sync_events_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket" ADD CONSTRAINT "event_ticket_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boat_owner_idx" ON "boat" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "boat_captain_idx" ON "boat" USING btree ("primary_captain_id");--> statement-breakpoint
CREATE INDEX "boat_category_idx" ON "boat" USING btree ("category");--> statement-breakpoint
CREATE INDEX "boat_spatial_idx" ON "boat" USING gist ("location");--> statement-breakpoint
CREATE INDEX "boat_featured_idx" ON "boat" USING btree ("featured","featured_order");--> statement-breakpoint
CREATE INDEX "boat_ranking_idx" ON "boat" USING btree ("search_ranking_score");--> statement-breakpoint
CREATE INDEX "boat_search_name_idx" ON "boat" USING btree ("name");--> statement-breakpoint
CREATE INDEX "boat_search_make_model_idx" ON "boat" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "boating_exp_idx" ON "user" USING btree ("boating_experience");--> statement-breakpoint
CREATE INDEX "user_search_name_idx" ON "user" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "user_search_username_idx" ON "user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "captain_status_idx" ON "captain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "captain_location_idx" ON "captain" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "captain_license_idx" ON "captain" USING btree ("license_type");--> statement-breakpoint
CREATE INDEX "booking_type_idx" ON "booking" USING btree ("booking_type");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("booking_status");--> statement-breakpoint
CREATE INDEX "booking_user_idx" ON "booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_boat_idx" ON "booking" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "booking_captain_idx" ON "booking" USING btree ("captain_id");--> statement-breakpoint
CREATE INDEX "booking_datetime_idx" ON "booking" USING btree ("start_datetime","end_datetime");--> statement-breakpoint
CREATE INDEX "booking_search_customer_idx" ON "booking" USING btree ("customer_name","customer_email");--> statement-breakpoint
CREATE INDEX "review_type_idx" ON "review" USING btree ("type");--> statement-breakpoint
CREATE INDEX "review_booking_idx" ON "review" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "review_reviewer_idx" ON "review" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "review_boat_idx" ON "review" USING btree ("reviewed_boat_id");--> statement-breakpoint
CREATE INDEX "review_captain_idx" ON "review" USING btree ("reviewed_captain_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("reviewed_user_id");--> statement-breakpoint
CREATE INDEX "verification_user_idx" ON "verification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_status_idx" ON "verification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "verification_type_idx" ON "verification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_related_idx" ON "notification" USING btree ("related_id","related_type");--> statement-breakpoint
CREATE INDEX "inquiry_status_idx" ON "general_inquiry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inquiry_email_idx" ON "general_inquiry" USING btree ("email");--> statement-breakpoint
CREATE INDEX "inquiry_date_idx" ON "general_inquiry" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blog_post_status_idx" ON "blog_post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_post_category_idx" ON "blog_post" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_post_featured_idx" ON "blog_post" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "blog_post_published_idx" ON "blog_post" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blog_post_author_idx" ON "blog_post" USING btree ("author");--> statement-breakpoint
CREATE INDEX "blog_post_slug_idx" ON "blog_post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_post_created_idx" ON "blog_post" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "boat_pricing_boat_idx" ON "boat_pricing_tier" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_pricing_hours_idx" ON "boat_pricing_tier" USING btree ("hours");--> statement-breakpoint
CREATE INDEX "boat_blocking_boat_id_idx" ON "boat_blocking" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_blocking_time_range_idx" ON "boat_blocking" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "boat_blocking_type_idx" ON "boat_blocking" USING btree ("blocking_type");--> statement-breakpoint
CREATE INDEX "conversation_booking_idx" ON "conversation" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_idx" ON "conversation" USING gin ("participant_ids");--> statement-breakpoint
CREATE INDEX "conversation_status_idx" ON "conversation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_type_idx" ON "conversation" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversation_last_message_idx" ON "conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "conversation_last_activity_idx" ON "conversation" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "conversation_assigned_admin_idx" ON "conversation" USING btree ("assigned_admin");--> statement-breakpoint
CREATE INDEX "conversation_priority_idx" ON "conversation" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "conversation_tags_idx" ON "conversation" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "conversation_created_idx" ON "conversation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_conversation_created_idx" ON "message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "message_conversation_updated_idx" ON "message" USING btree ("conversation_id","updated_at");--> statement-breakpoint
CREATE INDEX "message_status_idx" ON "message" USING btree ("status");--> statement-breakpoint
CREATE INDEX "message_type_idx" ON "message" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "message_flagged_idx" ON "message" USING btree ("is_flagged");--> statement-breakpoint
CREATE INDEX "message_deleted_idx" ON "message" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "message_created_idx" ON "message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "conversation_participant_conversation_idx" ON "conversation_participant" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_user_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_status_idx" ON "conversation_participant" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_participant_archived_idx" ON "conversation_participant" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "conversation_participant_muted_idx" ON "conversation_participant" USING btree ("is_muted");--> statement-breakpoint
CREATE INDEX "conversation_participant_unread_idx" ON "conversation_participant" USING btree ("user_id","unread_count");--> statement-breakpoint
CREATE INDEX "conversation_participant_last_read_idx" ON "conversation_participant" USING btree ("last_read_at");--> statement-breakpoint
CREATE INDEX "conversation_participant_joined_idx" ON "conversation_participant" USING btree ("joined_at");--> statement-breakpoint
CREATE INDEX "boat_google_calendars_boat_idx" ON "boat_google_calendars" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "boat_google_calendars_owner_idx" ON "boat_google_calendars" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "boat_google_calendars_boat_owner_idx" ON "boat_google_calendars" USING btree ("boat_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_boat_idx" ON "external_google_calendar_sync_events" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_boat_calendar_idx" ON "external_google_calendar_sync_events" USING btree ("boat_calendar_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_booking_idx" ON "external_google_calendar_sync_events" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_event_idx" ON "external_google_calendar_sync_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "external_google_calendar_sync_events_time_idx" ON "external_google_calendar_sync_events" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "event_active_idx" ON "event" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "event_time_idx" ON "event" USING btree ("start_at","end_at");--> statement-breakpoint
CREATE INDEX "event_ticket_event_idx" ON "event_ticket" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_ticket_email_idx" ON "event_ticket" USING btree ("purchaser_email");