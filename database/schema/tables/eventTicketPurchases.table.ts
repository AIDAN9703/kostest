import { pgTable, uuid, varchar, decimal, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { events } from './events.table';

// When someone buys event tickets (one purchase can have multiple tickets)
export const eventTicketPurchases = pgTable('event_ticket_purchases', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'restrict' }), // Can't delete event with purchases
  
  // Customer info
  buyerName: varchar('buyer_name', { length: 200 }).notNull(),
  buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),
  buyerPhone: varchar('buyer_phone', { length: 20 }),
  
  // Payment
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  isPaid: boolean('is_paid').default(false).notNull(),
  
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('event_ticket_purchases_event_idx').on(table.eventId),
  index('event_ticket_purchases_email_idx').on(table.buyerEmail),
]);
