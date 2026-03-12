import { pgTable, uuid, varchar, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

// Your boat party events
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // for URLs
  description: text('description'),
  
  eventDate: timestamp('event_date', { mode: 'date', withTimezone: true }).notNull(),
  startTime: timestamp('start_time', { mode: 'date', withTimezone: true }),
  endTime: timestamp('end_time', { mode: 'date', withTimezone: true }),
  location: varchar('location', { length: 255 }),
  yachtName: varchar('yacht_name', { length: 255 }),
  
  totalCapacity: integer('total_capacity').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  // One Stripe Product per Event (contains all ticket tiers)
  stripeProductId: varchar('stripe_product_id', { length: 255 }),
  
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('events_slug_idx').on(table.slug),
  index('events_active_idx').on(table.isActive),
  index('events_date_idx').on(table.eventDate),
]);