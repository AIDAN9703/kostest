import { db } from "@/database/db";
import { bookings, inquiry, inquiryEvents } from "@/database/schema";
import { eq } from "drizzle-orm";
import { advanceInquiryStage } from "@/features/inquiries/inquiry-stage";

/**
 * Lead-side effects of the proposal/booking lifecycle, callable from the
 * bookings feature without auth checks (the caller already gated access).
 * Every function here is fire-and-forget safe: a lead bookkeeping failure
 * must never roll back or crash a booking write, so nothing throws.
 *
 * Lifecycle mapping:
 *   draft proposal SENT      → stage OFFER_SENT   (lead stays OPEN)
 *   customer accepts / pays  → stage CONVERTED + outcome WON
 *   booking confirmed by any path (webhook, admin) → same conversion
 */

/** Sending a proposal is an offer, not a win — advance the open lead only. */
export async function markInquiryOfferSentForLead(
  inquiryId: string,
  actorId: string | null
): Promise<void> {
  try {
    const [lead] = await db
      .select({ stage: inquiry.stage, outcome: inquiry.outcome })
      .from(inquiry)
      .where(eq(inquiry.id, inquiryId));
    if (!lead || lead.outcome !== "OPEN") return;

    await advanceInquiryStage(inquiryId, lead.stage, "OFFER_SENT", actorId);
  } catch (error) {
    console.error("Failed to mark inquiry offer as sent:", error);
  }
}

/**
 * Mark a lead converted by a booking: convertedBookingId + stage CONVERTED +
 * outcome WON, with one combined timeline event. Idempotent — safe to call
 * from every confirmation path (acceptance, Stripe webhook, admin confirm).
 */
export async function markInquiryConverted(
  inquiryId: string,
  bookingId: string,
  actorId: string | null
): Promise<void> {
  try {
    const [lead] = await db
      .select({
        stage: inquiry.stage,
        outcome: inquiry.outcome,
        convertedBookingId: inquiry.convertedBookingId,
      })
      .from(inquiry)
      .where(eq(inquiry.id, inquiryId));
    if (!lead) return;
    if (lead.stage === "CONVERTED" && lead.outcome === "WON" && lead.convertedBookingId) return;

    await db
      .update(inquiry)
      .set({
        convertedBookingId: bookingId,
        stage: "CONVERTED",
        outcome: "WON",
        updatedAt: new Date(),
      })
      .where(eq(inquiry.id, inquiryId));

    await db.insert(inquiryEvents).values({
      inquiryId,
      eventType: "STAGE_CHANGE",
      createdBy: actorId,
      previousStage: lead.stage,
      newStage: "CONVERTED",
      previousOutcome: lead.outcome,
      newOutcome: "WON",
      content: "Converted to booking",
      metadata: { bookingId },
    });
  } catch (error) {
    console.error("Failed to mark inquiry as converted:", error);
  }
}

/** Convert the lead behind a booking, if there is one. */
export async function convertInquiryForBooking(
  bookingId: string,
  actorId: string | null
): Promise<void> {
  try {
    const [booking] = await db
      .select({ inquiryId: bookings.inquiryId })
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    if (booking?.inquiryId) {
      await markInquiryConverted(booking.inquiryId, bookingId, actorId);
    }
  } catch (error) {
    console.error("Failed to convert inquiry for booking:", error);
  }
}
