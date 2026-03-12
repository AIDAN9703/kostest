import { relations } from "drizzle-orm";
import { bookingOps } from "../tables/bookingOps.table";
import { bookings } from "../tables/bookings.table";

export const bookingOpsRelations = relations(bookingOps, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingOps.bookingId],
    references: [bookings.id],
  }),
}));
