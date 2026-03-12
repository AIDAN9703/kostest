import { relations } from 'drizzle-orm';
import { payments } from '../tables/payments.table';

/**
 * Payments Relations
 * 
 * Note: This table uses polymorphic relationships via payable_type + payable_id.
 * Drizzle doesn't natively support polymorphic relations, so we handle lookups
 * in application code based on payable_type.
 * 
 * For example:
 * - If payable_type = 'BOOKING', use payable_id to look up bookings table
 * - If payable_type = 'EVENT_TICKET', use payable_id to look up event_tickets table
 */
export const paymentsRelations = relations(payments, ({ }) => ({
  // Polymorphic relations are handled in application code
  // based on payable_type discriminator
}));
