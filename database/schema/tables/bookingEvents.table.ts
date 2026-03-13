import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.table";
import { users } from "./users.table";
import { contactMethodEnum } from "@/database/schema/enums";

/**
 * Booking events — single append-only timeline (audit + notes + contacts).
 * Immutable rows; corrections are new events if ever needed.
 */
export const bookingEvents = pgTable(
  "booking_event",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),

    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),

    /** user | admin | system */
    actorType: text("actor_type").notNull().default("system"),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),

    /** e.g. booking.status_changed, booking.note_added */
    eventType: text("event_type").notNull(),

    channel: text("channel"), // web | admin_portal | stripe | email, etc.

    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),

    displayMessage: text("display_message"),

    /** Note body or contact summary */
    content: text("content"),

    contactMethod: contactMethodEnum("contact_method"),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("booking_event_booking_idx").on(table.bookingId),
    index("booking_event_created_idx").on(table.createdAt),
    index("booking_event_type_idx").on(table.eventType),
    index("booking_event_actor_idx").on(table.actorId),
  ]
);
