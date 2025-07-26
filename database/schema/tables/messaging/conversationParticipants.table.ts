import { pgTable, uuid, text, boolean, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { users, conversations } from "@/database/schema/tables";




export const conversationParticipants = pgTable("conversation_participant", {
    // Core Relationship
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    
    // Participant Status
    status: text("status").default("ACTIVE").notNull(), // ACTIVE, LEFT, REMOVED, MUTED
    role: text("role").default("PARTICIPANT").notNull(), // PARTICIPANT, MODERATOR, ADMIN
    
    // Personalization
    isArchived: boolean("is_archived").default(false).notNull(), // User archived this conversation
    isMuted: boolean("is_muted").default(false).notNull(), // User muted notifications
    customName: text("custom_name"), // User's custom name for this conversation
    
    // Read Status
    lastReadAt: timestamp("last_read_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    lastReadMessageId: uuid("last_read_message_id"), // Last message this user read
    unreadCount: integer("unread_count").default(0).notNull(), // Unread messages for this user
    
    // Notification Preferences
    notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    smsNotifications: boolean("sms_notifications").default(false).notNull(),
    
    // Timestamps
    joinedAt: timestamp("joined_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    leftAt: timestamp("left_at", { mode: "date", withTimezone: true }),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => [
    // Unique constraint - each user can only be in a conversation once
    unique("conversation_participant_unique").on(table.conversationId, table.userId),
    
    // Primary indexes for participant queries
    index("conversation_participant_conversation_idx").on(table.conversationId),
    index("conversation_participant_user_idx").on(table.userId),
    
    // Status and filtering indexes
    index("conversation_participant_status_idx").on(table.status),
    index("conversation_participant_archived_idx").on(table.isArchived),
    index("conversation_participant_muted_idx").on(table.isMuted),
    
    // Read status indexes for unread counts
    index("conversation_participant_unread_idx").on(table.userId, table.unreadCount),
    index("conversation_participant_last_read_idx").on(table.lastReadAt),
    
    // Timestamps
    index("conversation_participant_joined_idx").on(table.joinedAt),
  ]);