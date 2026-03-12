/**
 * Payments Feature - Central Exports
 * 
 * Provides a polymorphic payment tracking system that can handle
 * payments for any payable entity (bookings, event tickets, etc.)
 * 
 * All monetary values are in CENTS.
 */

export { 
  paymentService, 
  PaymentService,
  type CreatePaymentInput,
  type UpdatePaymentInput,
} from './payment.service';

// Re-export database types for convenience
export type {
  Payment,
  NewPayment,
  PaymentStatus,
  PaymentType,
  PaymentMethodType,
  PayableType,
} from '@/database/types';
