ALTER TABLE "boat" ADD COLUMN "featured_order" integer;--> statement-breakpoint
ALTER TABLE "boat" ADD COLUMN "search_ranking_score" double precision DEFAULT 0;--> statement-breakpoint
CREATE INDEX "boat_featured_idx" ON "boat" USING btree ("featured","featured_order");--> statement-breakpoint
CREATE INDEX "boat_ranking_idx" ON "boat" USING btree ("search_ranking_score");