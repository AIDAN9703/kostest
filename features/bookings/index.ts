/**
 * Bookings Feature - Central Exports
 * 
 * This file provides a clean API for the bookings feature.
 * Import from here rather than individual files.
 */

// ============================================================================
// SERVICES
// ============================================================================

export { bookingService, BookingService } from './booking.service';
export { bookingPricingService, BookingPricingService } from './booking-pricing.service';
export { bookingStatusService, BookingStatusService, isValidStatusTransition } from './booking-status.service';
export { bookingNotesService, BookingNotesService } from './booking-notes.service';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Database enum types
  BookingStatus,
  BookingType,
  BookingSource,
  PaymentStatus,
  PaymentType,
  AdminNoteType,
  
  // New structured types (cents-based)
  BookingPricingData,
  BookingPaymentData,
  BookingStatusHistoryEntry,
  BookingAdminNoteEntry,
  BookingWithRelations,
  BookingListItemNew,
  PaginatedBookingsResponseNew,
  BookingStatsNew,
  
  // Legacy types (dollars-based, for backward compatibility)
  BookingListItem,
  BookingDetails,
  PaginatedBookingsResponse,
  BookingStats,
  
  // Form and display types
  BookingFormData,
  BookingWithDetails,
  SafeBoatData,
  BookingCalendarEvent,
  ProfileBooking,
  PricingTier,
  
  // API response types
  BookingApiResponse,
  PaginatedBookingApiResponse,
} from './booking.types';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export {
  bookingFilterSchema,
  bookingUpdateSchema,
  bookingCreateSchema,
  type BookingFilterInput,
  type BookingUpdateInput,
  type BookingCreateInput,
} from './booking.validation';

// ============================================================================
// SERVER ACTIONS
// ============================================================================

export {
  // Customer-facing
  createBookingRequest,
  createBookingRequestAction,
  createInstantBooking,
  createInstantBookingAction,
  
  // Admin workflow
  approveBookingRequest,
  denyBookingRequest,
  assignAdminToBooking,
  unassignAdminFromBooking,
  markBookingAsContacted,
  addBookingNote,
  completeBooking,
  cancelBooking,
  
  // Stripe
  createPaymentLinkForBooking,
  getPaymentLinkStatus,
  getPaymentLinkUrl,
  markPaymentLinkSucceeded,
} from './actions';
