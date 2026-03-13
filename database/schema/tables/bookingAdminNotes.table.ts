import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { users } from "./users.table";
import { adminNoteTypeEnum } from "@/database/schema/enums";

/*
 * Booking Admin Notes Table
 */
export const bookingAdminNotes = pgTable(
  "booking_admin_note",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    adminUserId: uuid("admin_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Note details
    noteType: adminNoteTypeEnum("note_type").default("GENERAL").notNull(),
    content: text("content").notNull(),

    // Timestamp
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Index for looking up notes by booking
    index("booking_admin_note_booking_idx").on(table.bookingId),
    // Index for filtering by admin
    index("booking_admin_note_admin_idx").on(table.adminUserId),
    // Index for timeline queries
    index("booking_admin_note_created_idx").on(table.createdAt),
  ]
);
