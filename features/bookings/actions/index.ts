/**
 * Booking Actions - Server Actions for booking operations
 *
 * STRUCTURE:
 * - Customer-facing: createBookingRequest, createInstantBooking
 * - Admin workflow: approveBookingRequest, denyBookingRequest, assignAdmin, etc.
 * - Stripe: createPaymentLinkForBooking, getPaymentLinkUrl
 */

// Customer-facing booking flows
export { createBookingRequest, createBookingRequestAction } from "./request";

export { createInstantBooking, createInstantBookingAction } from "./instant";

// Admin workflow actions
export {
  approveBookingRequest,
  denyBookingRequest,
  assignAdminToBooking,
  unassignAdminFromBooking,
  markBookingAsContacted,
  addBookingNote,
  completeBooking,
  cancelBooking,
} from "./admin-booking.actions";

// Stripe payment link utilities
export {
  createPaymentLinkForBooking,
  getPaymentLinkStatus,
  getPaymentLinkUrl,
  markPaymentLinkSucceeded,
} from "./stripe-payment-links";
