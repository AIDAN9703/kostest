import { pgTable, serial, varchar, decimal, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { events } from './events.table';

// Different ticket types (Early Bird $40, Regular $50, VIP $80)
export const ticketTiers = pgTable('ticket_tiers', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  
  name: varchar('name', { length: 100 }).notNull(), // "Early Bird", "VIP", etc.
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  maxQuantity: integer('max_quantity').notNull(), // how many of this type available
  soldQuantity: integer('sold_quantity').default(0).notNull(),
  
  // Optional: sales window
  saleStartDate: timestamp('sale_start_date'),
  saleEndDate: timestamp('sale_end_date'),
  
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(), // display order
  
  // Each tier has its own Stripe Price (under the event's Product)
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
