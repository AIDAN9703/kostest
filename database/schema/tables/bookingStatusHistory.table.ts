import { pgTable, uuid, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { users } from "./users.table";
import { bookingStatusEnum } from "@/database/schema/enums";

/**
 * Booking Status History Table
 * 
 * Audit trail for booking status changes. Every status transition is logged.
 * Enables:
 * - Full audit trail for compliance
 * - Debugging booking lifecycle issues
 * - Analytics (e.g., "average time from PENDING to CONFIRMED")
 * - Storing cancellation reasons, denial reasons, etc.
 */
export const bookingStatusHistory = pgTable("booking_status_history", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),

  // Status transition
  fromStatus: bookingStatusEnum("from_status"), // Null for initial creation
  toStatus: bookingStatusEnum("to_status").notNull(),

  // Who made the change
  changedByUserId: uuid("changed_by_user_id")
    .references(() => users.id, { onDelete: "set null" }), // Null for system changes
  
  // Context
  reason: text("reason"), // Cancellation reason, denial reason, etc.
  metadata: jsonb("metadata"), // Any additional context (JSON)

  // Timestamp
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Index for looking up history by booking
  index("booking_status_history_booking_idx").on(table.bookingId),
  // Index for filtering by status
  index("booking_status_history_to_status_idx").on(table.toStatus),
  // Index for timeline queries
  index("booking_status_history_created_idx").on(table.createdAt),
]);
