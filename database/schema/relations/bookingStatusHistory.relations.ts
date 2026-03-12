import { relations } from 'drizzle-orm';
import { bookingStatusHistory } from '../tables/bookingStatusHistory.table';
import { bookings } from '../tables/bookings.table';
import { users } from '../tables/users.table';

export const bookingStatusHistoryRelations = relations(bookingStatusHistory, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingStatusHistory.bookingId],
    references: [bookings.id],
  }),
  changedBy: one(users, {
    fields: [bookingStatusHistory.changedByUserId],
    references: [users.id],
  }),
}));
