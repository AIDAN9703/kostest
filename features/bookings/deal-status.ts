/**
 * The unified deal lifecycle — one status vocabulary for every row in the
 * master bookings list. Matches the pipeline the ops lead runs the business
 * on: Inquiry → Booking inquiry → Invoice sent → Partial payment → Payment
 * complete, with Dispute (orange) and Cancelled off to the side. Completed
 * (trip happened) and Archived are the two housekeeping states the sheet
 * tracked implicitly. Every stage is DERIVED — bookingStatus + the payments
 * ledger stay the source of truth; nothing here is stored.
 */

export type DealStatus =
  | "INQUIRY"
  | "BOOKING_INQUIRY"
  | "INVOICE_SENT"
  | "PARTIAL_PAYMENT"
  | "PAYMENT_COMPLETE"
  | "DISPUTE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export function computeDealStatusForBooking(input: {
  bookingStatus: string;
  paymentDisplayStatus?: string | null;
  hasRefund?: boolean | null;
  archivedAt?: Date | string | null;
}): DealStatus {
  const { bookingStatus, paymentDisplayStatus, hasRefund, archivedAt } = input;
  if (archivedAt) return "ARCHIVED";
  if (bookingStatus === "CANCELLED") return "CANCELLED";
  if (bookingStatus === "COMPLETED") return "COMPLETED";
  if (
    hasRefund ||
    paymentDisplayStatus === "REFUNDED" ||
    paymentDisplayStatus === "CHARGEBACK" ||
    paymentDisplayStatus === "FAILED"
  ) {
    return "DISPUTE";
  }
  if (paymentDisplayStatus === "PAID") return "PAYMENT_COMPLETE";
  if (paymentDisplayStatus === "DEPOSIT_PAID") return "PARTIAL_PAYMENT";
  // APPROVED = the customer has the payment link/invoice; DRAFT = a priced
  // proposal exists (sent or being finished — publishedAt isn't in list rows).
  if (bookingStatus === "DRAFT" || bookingStatus === "APPROVED") return "INVOICE_SENT";
  // PENDING = a formal request to book (boat + date + price) awaiting review.
  if (bookingStatus === "PENDING") return "BOOKING_INQUIRY";
  return "INQUIRY";
}

/** Channel labels (booking.source) for meta lines. */
export const DEAL_SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  ADMIN: "Admin",
  BROKER: "Broker",
  HOME_PAGE: "Home page",
  BOAT_PAGE: "Boat page",
  CONTACT_PAGE: "Contact page",
  TERM_CHARTER_PAGE: "Term charter page",
  PHONE: "Phone",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  BOATSETTER: "Boatsetter",
  GETMYBOAT: "GetMyBoat",
  OTHER: "Other",
};

/**
 * Origin badge tint, grouped by channel family: admin work slate, human
 * channels amber, our own site sky, marketplaces teal, brokers violet.
 */
export const SOURCE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  PHONE: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  INSTAGRAM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  WHATSAPP: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  WEBSITE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  HOME_PAGE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  BOAT_PAGE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  CONTACT_PAGE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  TERM_CHARTER_PAGE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  BOATSETTER: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  GETMYBOAT: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  BROKER: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  OTHER: "bg-muted text-muted-foreground",
};

/** Compact payment chip per computed payment display status (board rows). */
export const PAYMENT_CHIP: Record<string, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-success-soft text-success" },
  DEPOSIT_PAID: { label: "Partial", className: "bg-warning-soft text-warning" },
  PROCESSING: { label: "Processing", className: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  REFUNDED: { label: "Refunded", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  CHARGEBACK: { label: "Chargeback", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  FAILED: { label: "Failed", className: "bg-destructive-soft text-destructive" },
  UNPAID: { label: "Unpaid", className: "bg-muted text-muted-foreground" },
};

/** Customer's stated time-of-day preference (fuzzy intake). */
export const TIME_OF_DAY_LABELS: Record<string, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  FLEXIBLE: "Flexible",
};

/** Lead-type / origin tags shown next to the deal status. */
export const DEAL_KIND_LABELS: Record<string, string> = {
  GENERAL_QUOTE: "Inquiry",
  BOAT_REQUEST: "Inquiry",
  MANUAL: "Inquiry",
  REQUEST: "Inquiry",
  EXTERNAL_BOOKING: "Inquiry",
  TERM_CHARTER: "Term charter",
  MARKETPLACE: "Marketplace",
  INSTANT_BOOK: "Instant book",
};
