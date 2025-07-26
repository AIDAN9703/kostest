import { pgTable, uuid, text, boolean, integer, timestamp, index, json } from "drizzle-orm/pg-core";
import { users, conversations } from "@/database/schema/tables";
import { messageTypeEnum, messageStatusEnum } from "@/database/schema/enums";

export const messages = pgTable("message", {
    // Core Information
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id),
    
    // Message Content
    content: text("content").notNull(),
    messageType: messageTypeEnum("message_type").default("TEXT").notNull(),
    
    // Attachments
    attachments: json("attachments"), // Array of attachment objects with URL, type, name, size
    
    // Message Status & Delivery
    status: messageStatusEnum("status").default("SENT").notNull(),
    
    // Read Tracking - JSON object with userId: timestamp pairs
    readBy: json("read_by").default("{}").notNull(), // {"userId": "2024-01-01T00:00:00.000Z", ...}
    readCount: integer("read_count").default(0).notNull(), // Denormalized count for performance
    
    
    // Message Metadata
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at", { mode: "date", withTimezone: true }),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
    deletedBy: uuid("deleted_by").references(() => users.id),
    
    // System Message Data
    systemMessageData: json("system_message_data"), // For system messages - booking updates, status changes, etc.
    
    // Moderation
    isFlagged: boolean("is_flagged").default(false).notNull(),
    flagReason: text("flag_reason"),
    flaggedBy: uuid("flagged_by").references(() => users.id),
    flaggedAt: timestamp("flagged_at", { mode: "date", withTimezone: true }),
    
    // Timestamps
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  
   
  }, (table) => [
    // Primary indexes for message retrieval
    index("message_conversation_idx").on(table.conversationId),
    index("message_sender_idx").on(table.senderId),
    
    // Indexes for message ordering and pagination
    index("message_conversation_created_idx").on(table.conversationId, table.createdAt),
    index("message_conversation_updated_idx").on(table.conversationId, table.updatedAt),
    
    // Status and type filtering
    index("message_status_idx").on(table.status),
    index("message_type_idx").on(table.messageType),
    
    
    
    // Moderation indexes
    index("message_flagged_idx").on(table.isFlagged),
    index("message_deleted_idx").on(table.isDeleted),
    
    // Search indexes
    index("message_created_idx").on(table.createdAt),
  ]);