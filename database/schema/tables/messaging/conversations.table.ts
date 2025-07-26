import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { conversationTypeEnum, conversationStatusEnum } from "@/database/schema/enums";
import { users, bookings } from "@/database/schema/tables";



export const conversations = pgTable("conversation", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    type: conversationTypeEnum("type").default("BOOKING").notNull(),
    status: conversationStatusEnum("status").default("ACTIVE").notNull(),
    
    // Relationships
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }), // Optional - null for general conversations
    initiatedBy: uuid("initiated_by").notNull().references(() => users.id), // User who started the conversation
    
    // Participants - stored as array for flexibility
    participantIds: uuid("participant_ids").array().notNull(), // Array of user IDs in this conversation
    
    // Conversation Metadata
    subject: text("subject"), // Optional subject/title for the conversation
    lastMessageId: uuid("last_message_id"), // Reference to most recent message (set after messages table)
    lastMessageAt: timestamp("last_message_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    lastActivityAt: timestamp("last_activity_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    
    // Message Counts
    messageCount: integer("message_count").default(0).notNull(),
    unreadCount: integer("unread_count").default(0).notNull(), // Total unread messages across all participants
    
    // Conversation Settings
    isLocked: boolean("is_locked").default(false).notNull(), // Prevent new messages (admin only)
    autoCloseAt: timestamp("auto_close_at", { mode: "date", withTimezone: true }), // Auto-close conversation after booking completion
    
    // Admin Management
    assignedAdmin: uuid("assigned_admin").references(() => users.id), // Admin assigned to handle this conversation
    priority: text("priority").default("NORMAL").notNull(), // HIGH, NORMAL, LOW
    tags: text("tags").array(), // Tags for categorization
    
    // Privacy & Visibility
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedBy: uuid("archived_by").references(() => users.id),
    archivedAt: timestamp("archived_at", { mode: "date", withTimezone: true }),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  }, (table) => [
    // Primary indexes for common queries
    index("conversation_booking_idx").on(table.bookingId),
    index("conversation_participants_idx").using("gin", table.participantIds), // GIN index for array queries
    index("conversation_status_idx").on(table.status),
    index("conversation_type_idx").on(table.type),
    
    // Indexes for message ordering and pagination
    index("conversation_last_message_idx").on(table.lastMessageAt),
    index("conversation_last_activity_idx").on(table.lastActivityAt),
    
    // Admin management indexes
    index("conversation_assigned_admin_idx").on(table.assignedAdmin),
    index("conversation_priority_idx").on(table.priority),
    
    // Search and filtering indexes
    index("conversation_tags_idx").using("gin", table.tags), // GIN index for tag searches
    index("conversation_created_idx").on(table.createdAt),
  ]);