import { pgEnum } from "drizzle-orm/pg-core";

// Payment status - lifecycle of a payment transaction
export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "PENDING",           // Payment initiated but not processed
  "PROCESSING",        // Being processed by Stripe
  "SUCCEEDED",         // Payment successful
  "FAILED",            // Payment failed
  "REFUNDED",          // Payment was refunded
  "CANCELLED",         // Payment was cancelled before processing
  "CHARGEBACK"         // Customer disputed the charge
]);

// Payment type - what kind of payment this is
export const paymentTypeEnum = pgEnum("PaymentType", [
  "DEPOSIT",           // Initial deposit
  "FULL_PAYMENT",      // Full payment (no deposit)
  "PARTIAL",           // Partial payment
  "ADDITIONAL",        // Additional charge (e.g., added hours)
  "REFUND"             // Refund (negative amount)
]);

// Payment method type - how the payment was collected
export const paymentMethodTypeEnum = pgEnum("PaymentMethodType", [
  "STRIPE_CHECKOUT",   // Stripe Checkout Session
  "STRIPE_LINK",       // Stripe Payment Link
  "STRIPE_INVOICE",    // Stripe Invoice
  "MANUAL"             // Manual entry (cash, check, wire, etc.)
]);

// Payable type - what entity the payment is for (polymorphic)
export const payableTypeEnum = pgEnum("PayableType", [
  "BOOKING", // Payment for a booking
]);