import type { GeneralInquiry } from "@/database/types";

/** Passed from the create-booking page when `?inquiryId=` is present */
export type InquiryBookingPrefill = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfPassengers: number;
  customerType: "guest" | "existing_user";
  startDateTime: string;
  endDateTime: string;
  adminNotes: string;
};

function addHoursToIso(iso: string, hours: number): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

/**
 * Maps a general inquiry into initial SingleBookingForm state (guest customer,
 * optional trip start/end from requested date & time).
 */
export function buildInquiryPrefillForBookingForm(
  inquiry: GeneralInquiry
): InquiryBookingPrefill {
  let startDateTime = "";
  if (inquiry.date) {
    const d = new Date(inquiry.date);
    const t = inquiry.time?.trim();
    if (t && /^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    startDateTime = d.toISOString();
  }
  const endDateTime = startDateTime ? addHoursToIso(startDateTime, 4) : "";

  const noteParts: string[] = [];
  if (inquiry.budget?.trim()) noteParts.push(`Budget: ${inquiry.budget.trim()}`);
  if (inquiry.message?.trim()) noteParts.push(inquiry.message.trim());
  const adminNotes = noteParts.join("\n\n");

  return {
    customerName: inquiry.name,
    customerEmail: inquiry.email,
    customerPhone: inquiry.phone?.trim() ?? "",
    numberOfPassengers: Math.max(1, inquiry.guests ?? 6),
    customerType: "guest",
    startDateTime,
    endDateTime,
    adminNotes,
  };
}
