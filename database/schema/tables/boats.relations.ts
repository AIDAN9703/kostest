import { relations } from 'drizzle-orm';
import { boats } from './boats.table';
import { boatPricingTiers } from './boatPricingTiers.table';
import { boatBlocking } from './boatBlocking.table';
import { boatGoogleCalendars } from './boatGoogleCalendars.table';
import { bookings } from './bookings.table';
import { reviews } from './reviews.table';
import { users } from './users.table';
import { captains } from './captains.table';

// Relations for boats table
export const boatsRelations = relations(boats, ({ one, many }) => ({
  owner: one(users, {
    fields: [boats.ownerId],
    references: [users.id],
  }),
  primaryCaptain: one(captains, {
    fields: [boats.primaryCaptainId],
    references: [captains.id],
  }),
  pricingTiers: many(boatPricingTiers),
  blocking: many(boatBlocking),
  googleCalendars: many(boatGoogleCalendars),
  bookings: many(bookings),
  reviews: many(reviews),
}));


