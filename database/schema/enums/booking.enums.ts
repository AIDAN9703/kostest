import { pgEnum } from "drizzle-orm/pg-core";

// New consolidated booking type enum
export const bookingTypeEnum = pgEnum("BookingType", [
    "REQUEST",         // Standard booking request that needs approval
    "INSTANT_BOOK",    // Instant booking (no approval needed)
    "EXTERNAL_BOOKING"
  ]);
  
  // New consolidated booking status enum
  export const bookingStatusEnum = pgEnum("BookingStatus", [
    "PENDING",         // Initial state for booking requests
    "APPROVED",        // Request approved, waiting for payment
    "CONFIRMED",       // Payment received, booking confirmed
    "DENIED",          // Request was denied
    "EXPIRED",         // Payment wasn't made within timeframe
    "CANCELLED",       // Cancelled by customer or owner
    "COMPLETED",       // Trip completed
    "REFUNDED"         // Booking was refunded
  ]);

  