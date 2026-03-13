/**
 * Booking activity / audit event types (dot notation).
 * Append-only log — add new types as strings; no enum migration needed.
 */
export const BOOKING_EVENT_TYPES = {
  CREATED: "booking.created",
  STATUS_CHANGED: "booking.status_changed",
  NOTE_ADDED: "booking.note_added",
  CONTACT_LOGGED: "booking.contact_logged",
  PAYMENT_RECEIVED: "booking.payment_received",
  /** Admin edited booking fields (dates, customer, boat, pricing, …) */
  UPDATED: "booking.updated",
  /** assignedAdminId changed */
  ASSIGNED_ADMIN_CHANGED: "booking.assigned_admin_changed",
  /** Shareable draft link published */
  DRAFT_PUBLISHED: "booking.draft_published",
} as const;

export type BookingEventType =
  (typeof BOOKING_EVENT_TYPES)[keyof typeof BOOKING_EVENT_TYPES];

export const BOOKING_ACTOR_TYPES = ["user", "admin", "system"] as const;
export type BookingActorType = (typeof BOOKING_ACTOR_TYPES)[number];
