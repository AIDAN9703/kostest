import { pgEnum } from "drizzle-orm/pg-core";

// Booking type - how the booking was initiated
export const bookingTypeEnum = pgEnum("BookingType", [
  "REQUEST",           // Standard booking request that needs approval
  "INSTANT_BOOK",      // Instant booking (no approval needed)
  "EXTERNAL_BOOKING"   // Admin-created external booking
]);

// Booking status - lifecycle states (pure booking lifecycle, no payment semantics)
export const bookingStatusEnum = pgEnum("BookingStatus", [
  "DRAFT",             // Admin-created, sent to customer, awaiting acceptance
  "PENDING",           // Initial state for booking requests
  "APPROVED",          // Request approved, waiting for payment
  "CONFIRMED",         // Payment received, booking confirmed
  "CANCELLED",         // Cancelled (covers denied, expired, refunded — see cancellationReason)
  "COMPLETED",         // Trip completed
]);

// Booking source - where the booking originated
export const bookingSourceEnum = pgEnum("BookingSource", [
  "WEBSITE",           // Customer booked via website
  "ADMIN",             // Admin created (phone/email/text lead)
  "BROKER"             // Created by external broker (future)
]);

// Admin note type - categorizes internal notes
export const adminNoteTypeEnum = pgEnum("AdminNoteType", [
  "GENERAL",           // General note
  "CONTACTED",         // Customer was contacted
  "FOLLOW_UP",         // Follow-up needed
  "ISSUE"              // Problem or concern
]);

  