import { pgTable, serial, varchar, decimal, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { events } from './events.table';

// When someone buys event tickets (one purchase can have multiple tickets)
export const eventTicketPurchases = pgTable('event_ticket_purchases', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  
  // Customer info
  buyerName: varchar('buyer_name', { length: 200 }).notNull(),
  buyerEmail: varchar('buyer_email', { length: 255 }).notNull(),
  buyerPhone: varchar('buyer_phone', { length: 20 }),
  
  // Payment
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  isPaid: boolean('is_paid').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
