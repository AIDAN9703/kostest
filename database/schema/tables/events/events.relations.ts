import { relations } from 'drizzle-orm';
import { events } from './events.table';
import { ticketTiers } from './ticketTiers.table';
import { eventTicketPurchases } from './eventTicketPurchases.table';
import { eventTickets } from './tickets.table';

// Relations for easy querying
export const eventsRelations = relations(events, ({ many }) => ({
  ticketTiers: many(ticketTiers),
  eventTicketPurchases: many(eventTicketPurchases),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTiers.eventId],
    references: [events.id],
  }),
  eventTickets: many(eventTickets),
}));

export const eventTicketPurchasesRelations = relations(eventTicketPurchases, ({ one, many }) => ({
  event: one(events, {
    fields: [eventTicketPurchases.eventId],
    references: [events.id],
  }),
  eventTickets: many(eventTickets),
}));

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  eventTicketPurchase: one(eventTicketPurchases, {
    fields: [eventTickets.purchaseId],
    references: [eventTicketPurchases.id],
  }),
  tier: one(ticketTiers, {
    fields: [eventTickets.tierId],
    references: [ticketTiers.id],
  }),
}));

// TypeScript types
export type Event = typeof events.$inferSelect;
export type TicketTier = typeof ticketTiers.$inferSelect;
export type EventTicketPurchase = typeof eventTicketPurchases.$inferSelect;
export type EventTicket = typeof eventTickets.$inferSelect;

// Helper type for creating events with tiers
export type EventWithTiers = Event & {
  ticketTiers: TicketTier[];
};

// Helper type for purchase with all tickets
export type EventTicketPurchaseWithTickets = EventTicketPurchase & {
  eventTickets: (EventTicket & { tier: TicketTier })[];
};
