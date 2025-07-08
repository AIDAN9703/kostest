CREATE TYPE "public"."PostCategory" AS ENUM('FLEET_NEWS', 'CONSERVATION', 'TIPS_ADVICE', 'CASE_STUDY', 'COMPANY_NEWS', 'SAFETY', 'EVENTS');--> statement-breakpoint
CREATE TYPE "public"."PostStatus" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');--> statement-breakpoint
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
);--> statement-breakpoint
CREATE INDEX "blog_post_status_idx" ON "blog_post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blog_post_category_idx" ON "blog_post" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_post_featured_idx" ON "blog_post" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "blog_post_published_idx" ON "blog_post" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "blog_post_author_idx" ON "blog_post" USING btree ("author");--> statement-breakpoint
CREATE INDEX "blog_post_slug_idx" ON "blog_post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_post_created_idx" ON "blog_post" USING btree ("created_at");
