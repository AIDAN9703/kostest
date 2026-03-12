import { relations } from 'drizzle-orm';
import { boatPricingTiers } from '../tables/boatPricingTiers.table';
import { boats } from '../tables/boats.table';
import { bookings } from '../tables/bookings.table';

// Relations for boatPricingTiers table
export const boatPricingTiersRelations = relations(boatPricingTiers, ({ one, many }) => ({
  boat: one(boats, {
    fields: [boatPricingTiers.boatId],
    references: [boats.id],
  }),
  bookings: many(bookings),
}));


