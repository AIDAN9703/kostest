import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// Your boat party events
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // for URLs
  description: text('description'),
  
  eventDate: timestamp('event_date').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  location: varchar('location', { length: 255 }),
  yachtName: varchar('yacht_name', { length: 255 }),
  
  totalCapacity: integer('total_capacity').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  // One Stripe Product per Event (contains all ticket tiers)
  stripeProductId: varchar('stripe_product_id', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});