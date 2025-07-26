import { pgEnum } from "drizzle-orm/pg-core";

export const conversationTypeEnum = pgEnum("ConversationType", [
    "BOOKING",      // Conversation related to a specific booking
    "GENERAL",      // General inquiry or communication
    "SUPPORT",      // Customer support conversation
    "ADMIN"         // Admin-initiated conversation
  ]);
  
  export const conversationStatusEnum = pgEnum("ConversationStatus", [
    "ACTIVE",       // Ongoing conversation
    "ARCHIVED",     // Conversation archived by user
    "CLOSED",       // Conversation closed (no further messages)
    "SYSTEM_CLOSED" // System-closed (e.g., booking completed)
  ]);
  
  export const messageTypeEnum = pgEnum("MessageType", [
    "TEXT",         // Regular text message
    "IMAGE",        // Image attachment
    "DOCUMENT",     // Document attachment
    "SYSTEM",       // System-generated message
    "BOOKING_UPDATE", // Booking status update
    "PAYMENT_UPDATE"  // Payment status update
  ]);
  
  export const messageStatusEnum = pgEnum("MessageStatus", [
    "SENT",         // Message sent successfully
    "DELIVERED",    // Message delivered to recipient(s)
    "READ",         // Message read by recipient(s)
    "FAILED"        // Message failed to send
  ]);