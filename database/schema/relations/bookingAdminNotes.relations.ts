import { relations } from 'drizzle-orm';
import { bookingAdminNotes } from '../tables/bookingAdminNotes.table';
import { bookings } from '../tables/bookings.table';
import { users } from '../tables/users.table';

export const bookingAdminNotesRelations = relations(bookingAdminNotes, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingAdminNotes.bookingId],
    references: [bookings.id],
  }),
  admin: one(users, {
    fields: [bookingAdminNotes.adminUserId],
    references: [users.id],
  }),
}));
