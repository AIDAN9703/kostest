import { relations } from 'drizzle-orm';
import { boats } from '../tables/boats.table';
import { boatPricingTiers } from '../tables/boatPricingTiers.table';
import { boatBlocking } from '../tables/boatBlocking.table';
import { bookings } from '../tables/bookings.table';
import { reviews } from '../tables/reviews.table';
import { users } from '../tables/users.table';
// Relations for boats table
export const boatsRelations = relations(boats, ({ one, many }) => ({
  owner: one(users, {
    fields: [boats.ownerId],
    references: [users.id],
  }),
  primaryCaptain: one(users, {
    fields: [boats.primaryCaptainUserId],
    references: [users.id],
    relationName: 'primaryCaptainBoats',
  }),
  pricingTiers: many(boatPricingTiers),
  blocking: many(boatBlocking),
  bookings: many(bookings),
  reviews: many(reviews),
}));


