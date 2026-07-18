/**
 * The unified deal lifecycle — one status vocabulary for everything in the
 * master bookings list, whether the row is an unconverted lead (inquiry
 * table) or a booking. Mirrors the ops team's master-sheet color key:
 * inquiry (no color) → deposit in (yellow) → payment complete (green),
 * reconcile/dispute (orange), cancelled (red). Proposal sent and Completed
 * are the two states the sheet tracked implicitly.
 */

export type DealStatus =
  | "INQUIRY"
  | "PROPOSAL_SENT"
  | "DEPOSIT_IN"
  | "PAYMENT_COMPLETE"
  | "RECONCILE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  INQUIRY: "Inquiry",
  PROPOSAL_SENT: "Proposal sent",
  DEPOSIT_IN: "Deposit in",
  PAYMENT_COMPLETE: "Paid",
  RECONCILE: "Reconcile",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

/** Boss's sheet key, in semantic tokens (orange stays categorical — no token maps to it). */
export const DEAL_STATUS_CHIP_CLASSES: Record<DealStatus, string> = {
  INQUIRY: "bg-muted text-muted-foreground",
  PROPOSAL_SENT: "bg-primary-soft text-primary-strong",
  DEPOSIT_IN: "bg-warning-soft text-warning",
  PAYMENT_COMPLETE: "bg-success-soft text-success",
  RECONCILE: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  COMPLETED: "bg-muted text-foreground",
  CANCELLED: "bg-destructive-soft text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground/70",
};

/** Statuses hidden from the default master list (shown via the Archived pill). */
export const HIDDEN_DEAL_STATUSES: DealStatus[] = ["CANCELLED", "ARCHIVED"];

export function computeDealStatusForBooking(input: {
  bookingStatus: string;
  paymentDisplayStatus?: string | null;
  hasRefund?: boolean | null;
}): DealStatus {
  const { bookingStatus, paymentDisplayStatus, hasRefund } = input;
  if (bookingStatus === "CANCELLED") return "CANCELLED";
  if (bookingStatus === "COMPLETED") return "COMPLETED";
  if (
    hasRefund ||
    paymentDisplayStatus === "REFUNDED" ||
    paymentDisplayStatus === "CHARGEBACK" ||
    paymentDisplayStatus === "FAILED"
  ) {
    return "RECONCILE";
  }
  if (paymentDisplayStatus === "PAID") return "PAYMENT_COMPLETE";
  if (paymentDisplayStatus === "DEPOSIT_PAID") return "DEPOSIT_IN";
  if (bookingStatus === "DRAFT") return "PROPOSAL_SENT";
  // PENDING / APPROVED, nothing collected yet — still just an inquiry on the sheet.
  return "INQUIRY";
}

export function computeDealStatusForLead(input: {
  stage: string;
  outcome: string;
}): DealStatus {
  const { stage, outcome } = input;
  if (outcome === "LOST") return "CANCELLED";
  if (outcome === "ABANDONED") return "ARCHIVED";
  // WON leads don't render as rows — their booking does — but map sanely anyway.
  if (outcome === "WON") return "PAYMENT_COMPLETE";
  if (stage === "OFFER_SENT") return "PROPOSAL_SENT";
  return "INQUIRY";
}

/** Lead-type / origin tags shown next to the deal status. */
export const DEAL_KIND_LABELS: Record<string, string> = {
  GENERAL_QUOTE: "General",
  BOAT_REQUEST: "Boat inquiry",
  TERM_CHARTER: "Term charter",
  MANUAL: "Manual",
  MARKETPLACE: "Marketplace",
  REQUEST: "Request",
  INSTANT_BOOK: "Instant book",
  EXTERNAL_BOOKING: "Admin",
};
