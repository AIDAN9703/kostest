/**
 * Booking Actions - Server Actions for booking operations
 *
 * STRUCTURE:
 * - Customer-facing: createBookingRequest, createInstantBooking
 * - Admin workflow: approveBookingRequest, denyBookingRequest, assignAdmin, etc.
 * - Stripe: createCheckoutSessionForBooking, getOrCreateCheckoutUrl
 */

// Customer-facing booking flows
export { createBookingRequest, createBookingRequestAction } from "./request";

export { createInstantBooking, createInstantBookingAction } from "./instant";

// Admin workflow actions
export {
  approveBookingRequest,
  denyBookingRequest,
  assignAdminToBooking,
  markBookingAsContacted,
  addBookingNote,
  completeBooking,
  cancelBooking,
} from "./admin-booking.actions";

// Stripe checkout utilities
export {
  createCheckoutSessionForBooking,
  getOrCreateCheckoutUrl,
} from "./stripe-checkout";
