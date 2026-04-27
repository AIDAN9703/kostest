import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "@/database/schema/tables/bookings.table";
import { users } from "@/database/schema/tables/users.table";

/** Many-to-many: bookings ↔ crew users (distinct from primary captain on bookings). */
export const bookingCrew = pgTable(
  "booking_crew",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("booking_crew_booking_user_unique").on(t.bookingId, t.userId),
    index("booking_crew_booking_id_idx").on(t.bookingId),
  ]
);
