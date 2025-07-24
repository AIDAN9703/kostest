ALTER TABLE "blog_post" DROP CONSTRAINT "blog_post_author_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "blog_post_author_idx";--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "author" text DEFAULT 'KOS Team' NOT NULL;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "average_rating" double precision;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "blog_post_author_idx" ON "blog_post" USING btree ("author");--> statement-breakpoint
ALTER TABLE "blog_post" DROP COLUMN "author_id";