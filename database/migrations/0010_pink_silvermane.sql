ALTER TABLE "user" RENAME COLUMN "government_id_type" TO "identity_verification_type";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "display_name";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "two_factor_enabled";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "two_factor_secret";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "last_login_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "failed_login_attempts";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "account_locked_until";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_changed_at";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "reset_password_token";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "reset_password_expires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "force_password_change";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "government_id_verified";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "has_bank_account_connected";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "stripe_connect_account_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "payout_preference";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_boat_owner";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "owner_onboarding_complete";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_boats_listed";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "preferred_rental_types";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_bookings";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "total_reviews";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "average_rating";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "cancellation_rate";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "response_rate";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "response_time";--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."UserStatus";--> statement-breakpoint
CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'PENDING_VERIFICATION', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "status" SET DATA TYPE "public"."UserStatus" USING "status"::"public"."UserStatus";--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."UserStatus";