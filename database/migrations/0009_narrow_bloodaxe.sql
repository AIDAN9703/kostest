CREATE TYPE "public"."ProposalStatus" AS ENUM('DRAFT', 'PUBLISHED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "proposal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "ProposalStatus" DEFAULT 'DRAFT' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"user_id" uuid,
	"created_by_id" uuid,
	"start_datetime" timestamp with time zone NOT NULL,
	"end_datetime" timestamp with time zone,
	"number_of_passengers" integer NOT NULL,
	"pickup_location" text,
	"dropoff_location" text,
	"special_requests" text,
	"admin_notes" text,
	"customer_notes" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"expires_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposal_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE "proposal_boat_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"boat_id" uuid NOT NULL,
	"pricing_tier_id" uuid NOT NULL,
	"boat_name" text NOT NULL,
	"boat_main_image" text,
	"tier_name" text,
	"tier_hours" integer,
	"base_price" double precision NOT NULL,
	"cleaning_fee" double precision,
	"deposit_amount" double precision,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_line_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"applies_to_boat_option_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"unit_price" double precision NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_optional" boolean DEFAULT true NOT NULL,
	"is_default_selected" boolean DEFAULT false NOT NULL,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_selection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"customer_note" text,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposal_selection_proposal_unique" UNIQUE("proposal_id")
);
--> statement-breakpoint
CREATE TABLE "proposal_selection_boat_option" (
	"selection_id" uuid NOT NULL,
	"boat_option_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "proposal_selection_boat_option_pk" PRIMARY KEY("selection_id","boat_option_id")
);
--> statement-breakpoint
CREATE TABLE "proposal_selection_line_item" (
	"selection_id" uuid NOT NULL,
	"line_item_id" uuid NOT NULL,
	CONSTRAINT "proposal_selection_line_item_pk" PRIMARY KEY("selection_id","line_item_id")
);
--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_boat_option" ADD CONSTRAINT "proposal_boat_option_proposal_id_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_boat_option" ADD CONSTRAINT "proposal_boat_option_boat_id_boat_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_boat_option" ADD CONSTRAINT "proposal_boat_option_pricing_tier_id_boat_pricing_tier_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."boat_pricing_tier"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_line_item" ADD CONSTRAINT "proposal_line_item_proposal_id_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_line_item" ADD CONSTRAINT "proposal_line_item_applies_to_boat_option_id_proposal_boat_option_id_fk" FOREIGN KEY ("applies_to_boat_option_id") REFERENCES "public"."proposal_boat_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_selection" ADD CONSTRAINT "proposal_selection_proposal_id_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_selection_boat_option" ADD CONSTRAINT "proposal_selection_boat_option_selection_id_proposal_selection_id_fk" FOREIGN KEY ("selection_id") REFERENCES "public"."proposal_selection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_selection_boat_option" ADD CONSTRAINT "proposal_selection_boat_option_boat_option_id_proposal_boat_option_id_fk" FOREIGN KEY ("boat_option_id") REFERENCES "public"."proposal_boat_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_selection_line_item" ADD CONSTRAINT "proposal_selection_line_item_selection_id_proposal_selection_id_fk" FOREIGN KEY ("selection_id") REFERENCES "public"."proposal_selection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_selection_line_item" ADD CONSTRAINT "proposal_selection_line_item_line_item_id_proposal_line_item_id_fk" FOREIGN KEY ("line_item_id") REFERENCES "public"."proposal_line_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposal_status_idx" ON "proposal" USING btree ("status");--> statement-breakpoint
CREATE INDEX "proposal_customer_email_idx" ON "proposal" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "proposal_created_at_idx" ON "proposal" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "proposal_boat_option_proposal_idx" ON "proposal_boat_option" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_boat_option_boat_idx" ON "proposal_boat_option" USING btree ("boat_id");--> statement-breakpoint
CREATE INDEX "proposal_boat_option_tier_idx" ON "proposal_boat_option" USING btree ("pricing_tier_id");--> statement-breakpoint
CREATE INDEX "proposal_boat_option_primary_idx" ON "proposal_boat_option" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "proposal_line_item_proposal_idx" ON "proposal_line_item" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_line_item_boat_option_idx" ON "proposal_line_item" USING btree ("applies_to_boat_option_id");--> statement-breakpoint
CREATE INDEX "proposal_selection_boat_option_boat_idx" ON "proposal_selection_boat_option" USING btree ("boat_option_id");--> statement-breakpoint
CREATE INDEX "proposal_selection_line_item_line_item_idx" ON "proposal_selection_line_item" USING btree ("line_item_id");