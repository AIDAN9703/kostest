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
  /** captainUserId changed */
  ASSIGNED_CAPTAIN_CHANGED: "booking.assigned_captain_changed",
  /** booking_crew row added */
  CREW_MEMBER_ADDED: "booking.crew_member_added",
  /** booking_crew row removed */
  CREW_MEMBER_REMOVED: "booking.crew_member_removed",
  /** Shareable draft link published */
  DRAFT_PUBLISHED: "booking.draft_published",
  /** Customer asked for changes from the public proposal page */
  CHANGE_REQUESTED: "booking.change_requested",
} as const;

export type BookingEventType =
  (typeof BOOKING_EVENT_TYPES)[keyof typeof BOOKING_EVENT_TYPES];

export const BOOKING_ACTOR_TYPES = ["user", "admin", "system"] as const;
export type BookingActorType = (typeof BOOKING_ACTOR_TYPES)[number];
