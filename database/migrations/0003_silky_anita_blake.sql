DROP INDEX "boating_exp_idx";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_experience";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_license_number";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_license_expiry";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "boating_license_verified";--> statement-breakpoint
DROP TYPE "public"."BoatingExperienceLevel";