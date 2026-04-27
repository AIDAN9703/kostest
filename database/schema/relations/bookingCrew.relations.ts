import { relations } from "drizzle-orm";
import { bookingCrew } from "../tables/bookingCrew.table";
import { bookings } from "../tables/bookings.table";
import { users } from "../tables/users.table";

export const bookingCrewRelations = relations(bookingCrew, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingCrew.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [bookingCrew.userId],
    references: [users.id],
  }),
}));
