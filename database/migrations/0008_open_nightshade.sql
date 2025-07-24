CREATE TYPE "public"."ConversationStatus" AS ENUM('ACTIVE', 'ARCHIVED', 'CLOSED', 'SYSTEM_CLOSED');
CREATE TYPE "public"."ConversationType" AS ENUM('BOOKING', 'GENERAL', 'SUPPORT', 'ADMIN');
CREATE TYPE "public"."MessageStatus" AS ENUM('SENT', 'DELIVERED', 'READ', 'FAILED');
CREATE TYPE "public"."MessageType" AS ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'SYSTEM', 'BOOKING_UPDATE', 'PAYMENT_UPDATE');
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
	"parent_message_id" uuid,
	"thread_count" integer DEFAULT 0 NOT NULL,
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

ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_initiated_by_user_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_assigned_admin_user_id_fk" FOREIGN KEY ("assigned_admin") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "message" ADD CONSTRAINT "message_parent_message_id_message_id_fk" FOREIGN KEY ("parent_message_id") REFERENCES "public"."message"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "message" ADD CONSTRAINT "message_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "message" ADD CONSTRAINT "message_flagged_by_user_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "conversation_participant_conversation_idx" ON "conversation_participant" USING btree ("conversation_id");
CREATE INDEX "conversation_participant_user_idx" ON "conversation_participant" USING btree ("user_id");
CREATE INDEX "conversation_participant_status_idx" ON "conversation_participant" USING btree ("status");
CREATE INDEX "conversation_participant_archived_idx" ON "conversation_participant" USING btree ("is_archived");
CREATE INDEX "conversation_participant_muted_idx" ON "conversation_participant" USING btree ("is_muted");
CREATE INDEX "conversation_participant_unread_idx" ON "conversation_participant" USING btree ("user_id","unread_count");
CREATE INDEX "conversation_participant_last_read_idx" ON "conversation_participant" USING btree ("last_read_at");
CREATE INDEX "conversation_participant_joined_idx" ON "conversation_participant" USING btree ("joined_at");
CREATE INDEX "conversation_booking_idx" ON "conversation" USING btree ("booking_id");
CREATE INDEX "conversation_participants_idx" ON "conversation" USING gin ("participant_ids");
CREATE INDEX "conversation_status_idx" ON "conversation" USING btree ("status");
CREATE INDEX "conversation_type_idx" ON "conversation" USING btree ("type");
CREATE INDEX "conversation_last_message_idx" ON "conversation" USING btree ("last_message_at");
CREATE INDEX "conversation_last_activity_idx" ON "conversation" USING btree ("last_activity_at");
CREATE INDEX "conversation_assigned_admin_idx" ON "conversation" USING btree ("assigned_admin");
CREATE INDEX "conversation_priority_idx" ON "conversation" USING btree ("priority");
CREATE INDEX "conversation_tags_idx" ON "conversation" USING gin ("tags");
CREATE INDEX "conversation_created_idx" ON "conversation" USING btree ("created_at");
CREATE INDEX "message_conversation_idx" ON "message" USING btree ("conversation_id");
CREATE INDEX "message_sender_idx" ON "message" USING btree ("sender_id");
CREATE INDEX "message_conversation_created_idx" ON "message" USING btree ("conversation_id","created_at");
CREATE INDEX "message_conversation_updated_idx" ON "message" USING btree ("conversation_id","updated_at");
CREATE INDEX "message_status_idx" ON "message" USING btree ("status");
CREATE INDEX "message_type_idx" ON "message" USING btree ("message_type");
CREATE INDEX "message_parent_idx" ON "message" USING btree ("parent_message_id");
CREATE INDEX "message_flagged_idx" ON "message" USING btree ("is_flagged");
CREATE INDEX "message_deleted_idx" ON "message" USING btree ("is_deleted");
CREATE INDEX "message_created_idx" ON "message" USING btree ("created_at");