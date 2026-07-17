/**
 * Shared presentation maps for booking status — the bookings analog of
 * features/inquiries/inquiry-ui. Semantic tokens only. Keyed by string
 * because booking rows surface status as plain strings in list payloads.
 */

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Proposal",
  PENDING: "Pending",
  APPROVED: "Approved",
  CONFIRMED: "Payment confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Forward lifecycle for the read-only pipeline bar (CANCELLED is a banner, not a step). */
export const BOOKING_STATUS_FLOW: string[] = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "CONFIRMED",
  "COMPLETED",
];
