import { relations } from "drizzle-orm";
import { bookingExpenseLines } from "../tables/bookingExpenseLines.table";
import { bookings } from "../tables/bookings.table";

export const bookingExpenseLinesRelations = relations(
  bookingExpenseLines,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [bookingExpenseLines.bookingId],
      references: [bookings.id],
    }),
  })
);
