import * as z from "zod";

/**
 * Booking filter/search schema for URL params - Comprehensive filters for admin
 */
export const bookingFilterSchema = z.object({
  // Pagination
  page: z.coerce.number().optional(),
  limit: z.coerce.number().max(100).optional(),
  
  // Text search
  search: z.string().optional(),
  
  // Status filters
  bookingStatus: z.enum([
    'PENDING',
    'EXPIRED',
    'APPROVED',
    'CONFIRMED',
    'DENIED',
    'CANCELLED',
    'COMPLETED',
    'REFUNDED'
  ]).optional(),
  
  paymentStatus: z.enum([
    'AWAITING_PAYMENT',
    'PAID',
    'CHARGEBACK',
    'REFUNDED',
    'FAILED'
  ]).optional(),
  
  // Type filter
  bookingType: z.enum([
    'INSTANT_BOOK',
    'REQUEST',
    'EXTERNAL_BOOKING'
  ]).optional(),
  
  // Date range
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  
  // Related entities
  boatId: z.string().uuid("Invalid boat ID").optional(),
  customerId: z.string().uuid("Invalid customer ID").optional(),
  assignedAdminId: z.string().uuid("Invalid admin ID").optional(),
  
  // Boolean filters
  needsCaptain: z.coerce.boolean().optional(),
  
  // Amount range
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
});

// Inferred type from validation schema
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;

