import { relations } from 'drizzle-orm';
import { bookingPricing } from '../tables/bookingPricing.table';
import { bookings } from '../tables/bookings.table';

export const bookingPricingRelations = relations(bookingPricing, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPricing.bookingId],
    references: [bookings.id],
  }),
}));
