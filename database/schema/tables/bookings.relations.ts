import { relations } from 'drizzle-orm';
import { bookings } from './bookings.table';
import { users } from './users.table';
import { boats } from './boats.table';
import { captains } from './captains.table';
import { boatPricingTiers } from './boatPricingTiers.table';
import { reviews } from './reviews.table';

// Relations for bookings table
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
    relationName: 'userBookings',
  }),
  boatOwner: one(users, {
    fields: [bookings.boatOwnerId],
    references: [users.id],
    relationName: 'boatOwnerBookings',
  }),
  boat: one(boats, {
    fields: [bookings.boatId],
    references: [boats.id],
  }),
  captain: one(captains, {
    fields: [bookings.captainId],
    references: [captains.id],
  }),
  pricingTier: one(boatPricingTiers, {
    fields: [bookings.pricingTierId],
    references: [boatPricingTiers.id],
  }),
  reviewedByUser: one(users, {
    fields: [bookings.reviewedBy],
    references: [users.id],
    relationName: 'reviewedBookings',
  }),
  assignedAdmin: one(users, {
    fields: [bookings.assignedAdminId],
    references: [users.id],
    relationName: 'assignedBookings',
  }),
  cancelledByUser: one(users, {
    fields: [bookings.cancelledBy],
    references: [users.id],
    relationName: 'cancelledBookings',
  }),
  reviews: many(reviews),
}));

