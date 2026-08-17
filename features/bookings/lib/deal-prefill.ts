import type { BookingDetails } from "@/features/bookings/booking.types";

/**
 * Passed from the create/proposal page when `?dealId=` is present — maps an
 * INQUIRY-status deal into initial BookingComposer state so pricing it
 * UPGRADES that same row into a DRAFT proposal (one table, one id, one
 * history — see docs/UNIFIED_BOOKINGS_PLAN.md).
 */
export type DealPrefill = {
  /** The INQUIRY booking row being priced — threaded through the form so
   *  createBookings upgrades it instead of inserting a duplicate. */
  dealId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfPassengers: number;
  startDateTime: string;
  endDateTime: string;
  adminNotes: string;
  /** TCPA: lead opted into SMS — safe to default the SMS send toggle on. */
  smsConsent: boolean;
  /** Boat-page inquiries carry the boat — prefill it so tier/pricing start filled. */
  boatId: string;
  /** Display fallback for the pricing summary before the boat object loads. */
  boatName: string | null;
};

function addHoursToIso(iso: string, hours: number): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

/** Default start hour for fuzzy leads, by stated time-of-day preference. */
const TIME_OF_DAY_START_HOUR: Record<string, number> = {
  MORNING: 10,
  AFTERNOON: 14,
  EVENING: 18,
  FLEXIBLE: 12,
};

export function buildDealPrefillForBookingForm(deal: BookingDetails): DealPrefill {
  let startDateTime = "";
  let endDateTime = "";

  if (deal.startDateTime) {
    // Boat lead — exact window already chosen by the customer.
    startDateTime = new Date(deal.startDateTime).toISOString();
    endDateTime = deal.endDateTime
      ? new Date(deal.endDateTime).toISOString()
      : addHoursToIso(startDateTime, 4);
  } else if (deal.preferredDate) {
    // Fuzzy lead — suggest a start from the stated day + time-of-day preference.
    const hour = TIME_OF_DAY_START_HOUR[deal.preferredTimeOfDay ?? "FLEXIBLE"] ?? 12;
    const d = new Date(`${deal.preferredDate}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(hour, 0, 0, 0);
      startDateTime = d.toISOString();
      endDateTime = addHoursToIso(startDateTime, 4);
    }
  }

  const noteParts: string[] = [];
  if (deal.destination?.trim()) noteParts.push(`Destination: ${deal.destination.trim()}`);
  if (deal.requestedDurationDays) {
    noteParts.push(`Requested duration: ${deal.requestedDurationDays}+ days`);
  }
  if (deal.customerMessage?.trim()) noteParts.push(deal.customerMessage.trim());

  return {
    dealId: deal.id,
    customerName: deal.customerName ?? "",
    customerEmail: deal.customerEmail ?? "",
    customerPhone: deal.customerPhone?.trim() ?? "",
    numberOfPassengers: Math.max(1, deal.numberOfPassengers ?? 6),
    startDateTime,
    endDateTime,
    adminNotes: noteParts.join("\n\n"),
    smsConsent: deal.smsConsent,
    boatId: deal.boatId ?? "",
    boatName: deal.boatName ?? null,
  };
}
