import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { eventTicketPurchases } from './eventTicketPurchases.table';
import { ticketTiers } from './ticketTiers.table';

// Individual event tickets within a purchase
export const eventTickets = pgTable('event_tickets', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  purchaseId: uuid('purchase_id').notNull().references(() => eventTicketPurchases.id, { onDelete: 'cascade' }),
  tierId: uuid('tier_id').notNull().references(() => ticketTiers.id, { onDelete: 'restrict' }), // Can't delete tier with tickets
  
  // Unique ticket identifier for QR code
  ticketCode: varchar('ticket_code', { length: 100 }).notNull().unique(),
  
  // Attendee info (might be different from buyer)
  attendeeName: varchar('attendee_name', { length: 200 }),
  
  // Check-in status
  isCheckedIn: boolean('is_checked_in').default(false).notNull(),
  checkedInAt: timestamp('checked_in_at', { mode: 'date', withTimezone: true }),
  
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('event_tickets_purchase_idx').on(table.purchaseId),
  index('event_tickets_tier_idx').on(table.tierId),
  index('event_tickets_code_idx').on(table.ticketCode),
]);



