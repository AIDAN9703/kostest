import { pgTable, serial, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { eventTicketPurchases } from './eventTicketPurchases.table';
import { ticketTiers } from './ticketTiers.table';

// Individual event tickets within a purchase
export const eventTickets = pgTable('event_tickets', {
  id: serial('id').primaryKey(),
  purchaseId: integer('purchase_id').notNull().references(() => eventTicketPurchases.id, { onDelete: 'cascade' }),
  tierId: integer('tier_id').notNull().references(() => ticketTiers.id),
  
  // Unique ticket identifier for QR code
  ticketCode: varchar('ticket_code', { length: 100 }).notNull().unique(),
  
  // Attendee info (might be different from buyer)
  attendeeName: varchar('attendee_name', { length: 200 }),
  
  // Check-in status
  isCheckedIn: boolean('is_checked_in').default(false).notNull(),
  checkedInAt: timestamp('checked_in_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



