import { relations } from "drizzle-orm";
import { bookingEvents } from "../tables/bookingEvents.table";
import { bookings } from "../tables/bookings.table";
import { users } from "../tables/users.table";

export const bookingEventsRelations = relations(bookingEvents, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingEvents.bookingId],
    references: [bookings.id],
  }),
  actor: one(users, {
    fields: [bookingEvents.actorId],
    references: [users.id],
  }),
}));
