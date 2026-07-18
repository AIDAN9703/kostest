/**
 * Shared Booking Types
 * 
 * These types are used across multiple features (users, bookings, admin, etc.)
 * to ensure consistency and type safety.
 * 
 * CONVENTIONS:
 * - All monetary values are in CENTS (integers)
 * - Types with "Cents" suffix indicate cents values
 * - Dates are Date objects in server code, ISO strings in client code
 */

import type { Cents } from "@/shared/lib/utils/money-utils";

/**
 * Minimal booking info for list views (user profile, admin tables, etc.)
 * Used when you only need basic booking information
 */
export interface BookingListItemShared {
  id: string;
  bookingStatus: string;
  bookingType: string;
  /** Null while the deal is an INQUIRY without a confirmed trip window. */
  startDateTime: Date | null;
  totalAmountCents: Cents | null;
  createdAt: Date;
}

/**
 * Booking list item for user contexts (profile pages, user detail pages)
 * Extends shared type with user-specific fields
 */
export interface UserBookingListItem extends BookingListItemShared {
  // Additional fields can be added here if needed for user contexts
}
