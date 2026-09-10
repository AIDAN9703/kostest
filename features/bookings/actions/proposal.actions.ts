"use server";

import { revalidatePath } from "next/cache";

import { bookingService } from "@/features/bookings/services/booking.service";
import { alertTeam } from "@/features/bookings/lib/team-alerts";

export interface AcceptProposalResponse {
  success: boolean;
  data?: { checkoutUrl: string | null };
  error?: string;
}

export async function acceptProposalAction(
  _prevState: AcceptProposalResponse,
  formData: FormData
): Promise<AcceptProposalResponse> {
  try {
    const publicToken = formData.get("publicToken") as string;
    const payNow = formData.get("payNow") === "true";
    const customerNote = (formData.get("customerNote") as string) || null;
    const chargeType = formData.get("chargeType") as "deposit" | "full" | null;

    if (!publicToken) {
      return { success: false, error: "Invalid link" };
    }

    const result = await bookingService.acceptProposal({
      publicToken,
      customerNote,
      payNow,
      chargeType: chargeType === "deposit" || chargeType === "full" ? chargeType : undefined,
    });

    // The customer just said yes — the team hears it without watching the
    // board. Only on a real flip: a returning visitor's "Complete payment"
    // re-enters this path with nothing left to accept.
    if (result.accepted > 0 && result.bookingIds[0]) {
      const lead = await bookingService.getBookingById(result.bookingIds[0]);
      if (lead) {
        const payingNow = payNow && Boolean(result.checkoutUrl);
        await alertTeam({
          subject: `Proposal accepted — ${lead.customerName}${lead.boatName ? ` · ${lead.boatName}` : ""}`,
          heading: payingNow ? "Proposal accepted — customer is paying now" : "Proposal accepted",
          booking: lead,
          extraLines: [{ label: "Customer note", value: customerNote }],
          note: payingNow
            ? "They're in Stripe checkout; a payment alert follows when it settles."
            : "Accepted without paying online — collect the balance and record it on the booking.",
        });
      }
    }

    return {
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl ?? null,
      },
    };
  } catch (error) {
    console.error("Accept proposal error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept the proposal",
    };
  }
}

export interface RequestProposalChangesResponse {
  success: boolean;
  error?: string;
}

/** Customer asks for changes from the public proposal page — logs straight
 *  onto the deal's activity timeline for the admin. */
export async function requestProposalChangesAction(
  _prevState: RequestProposalChangesResponse,
  formData: FormData
): Promise<RequestProposalChangesResponse> {
  try {
    const publicToken = (formData.get("publicToken") as string) || "";
    const message = ((formData.get("message") as string) || "").trim();

    if (!publicToken) return { success: false, error: "Invalid link" };
    if (!message) return { success: false, error: "Please describe the changes you'd like." };
    if (message.length > 2000) {
      return { success: false, error: "Please keep your message under 2000 characters." };
    }

    const { bookingId } = await bookingService.requestProposalChanges(publicToken, message);

    const booking = await bookingService.getBookingById(bookingId);
    await alertTeam({
      subject: `Change requested — ${booking?.customerName ?? "customer"}`,
      heading: "Customer requested changes to their proposal",
      booking,
      extraLines: [{ label: "Their message", value: message }],
      note: "Update the trip on the booking page, then resend — it's the same link.",
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Request proposal changes error:", error);
    return { success: false, error: "Failed to send your request. Please try again." };
  }
}
