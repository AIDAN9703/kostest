import type { Inquiry } from "@/database/types";

/** Passed from the create-booking page when `?inquiryId=` is present */
export type InquiryBookingPrefill = {
  /** Originating lead id — threaded through the form so the created booking links back. */
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfPassengers: number;
  customerType: "guest" | "existing_user";
  startDateTime: string;
  endDateTime: string;
  adminNotes: string;
  /** TCPA: lead opted into SMS — safe to default the SMS send toggle on. */
  smsConsent: boolean;
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

/**
 * Maps a lead into initial SingleBookingForm state. Boat leads carry exact
 * requested times; fuzzy leads (home/contact/term) get a start suggestion from
 * preferredDate + preferredTimeOfDay. Legacy date/time columns are the fallback
 * for pre-unification rows.
 */
export function buildInquiryPrefillForBookingForm(
  inquiry: Inquiry
): InquiryBookingPrefill {
  let startDateTime = "";
  let endDateTime = "";

  if (inquiry.requestedStartDateTime) {
    // Boat lead — exact window already chosen by the customer.
    startDateTime = new Date(inquiry.requestedStartDateTime).toISOString();
    endDateTime = inquiry.requestedEndDateTime
      ? new Date(inquiry.requestedEndDateTime).toISOString()
      : addHoursToIso(startDateTime, 4);
  } else if (inquiry.preferredDate) {
    // Fuzzy lead — suggest a start from the stated day + time-of-day preference.
    const hour = TIME_OF_DAY_START_HOUR[inquiry.preferredTimeOfDay ?? "FLEXIBLE"] ?? 12;
    const d = new Date(`${inquiry.preferredDate}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(hour, 0, 0, 0);
      startDateTime = d.toISOString();
      endDateTime = addHoursToIso(startDateTime, 4);
    }
  } else if (inquiry.date) {
    // Legacy rows (pre-unification).
    const d = new Date(inquiry.date);
    const t = inquiry.time?.trim();
    if (t && /^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    startDateTime = d.toISOString();
    endDateTime = addHoursToIso(startDateTime, 4);
  }

  const noteParts: string[] = [];
  if (inquiry.destination?.trim()) noteParts.push(`Destination: ${inquiry.destination.trim()}`);
  if (inquiry.requestedDurationDays) {
    noteParts.push(`Requested duration: ${inquiry.requestedDurationDays}+ days`);
  }
  if (inquiry.budget?.trim()) noteParts.push(`Budget: ${inquiry.budget.trim()}`);
  if (inquiry.message?.trim()) noteParts.push(inquiry.message.trim());
  const adminNotes = noteParts.join("\n\n");

  return {
    inquiryId: inquiry.id,
    customerName: inquiry.name,
    customerEmail: inquiry.email,
    customerPhone: inquiry.phone?.trim() ?? "",
    numberOfPassengers: Math.max(1, inquiry.guests ?? 6),
    customerType: "guest",
    startDateTime,
    endDateTime,
    adminNotes,
    smsConsent: inquiry.smsConsent ?? false,
  };
}
