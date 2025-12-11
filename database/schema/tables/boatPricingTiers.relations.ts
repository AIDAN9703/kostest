import { relations } from 'drizzle-orm';
import { boatPricingTiers } from './boatPricingTiers.table';
import { boats } from './boats.table';
import { bookings } from './bookings.table';

// Relations for boatPricingTiers table
export const boatPricingTiersRelations = relations(boatPricingTiers, ({ one, many }) => ({
  boat: one(boats, {
    fields: [boatPricingTiers.boatId],
    references: [boats.id],
  }),
  bookings: many(bookings),
}));


