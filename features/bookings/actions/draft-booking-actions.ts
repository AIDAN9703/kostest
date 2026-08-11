"use server";

import { revalidatePath } from "next/cache";

import { bookingService } from "@/features/bookings/services/booking.service";

export interface AcceptDraftBookingResponse {
  success: boolean;
  data?: { checkoutUrl: string | null };
  error?: string;
}

export async function acceptDraftBookingAction(
  _prevState: AcceptDraftBookingResponse,
  formData: FormData
): Promise<AcceptDraftBookingResponse> {
  try {
    const publicToken = formData.get("publicToken") as string;
    const payNow = formData.get("payNow") === "true";
    const customerNote = (formData.get("customerNote") as string) || null;
    const chargeType = formData.get("chargeType") as "deposit" | "full" | null;

    if (!publicToken) {
      return { success: false, error: "Invalid link" };
    }

    const result = await bookingService.acceptDraftBookings({
      publicToken,
      customerNote,
      payNow,
      chargeType: chargeType === "deposit" || chargeType === "full" ? chargeType : undefined,
    });

    return {
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl ?? null,
      },
    };
  } catch (error) {
    console.error("Accept draft booking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept draft booking",
    };
  }
}

export interface RequestDraftChangesResponse {
  success: boolean;
  error?: string;
}

/** Customer asks for changes from the public proposal page — logs straight
 *  onto the deal's activity timeline for the admin. */
export async function requestDraftChangesAction(
  _prevState: RequestDraftChangesResponse,
  formData: FormData
): Promise<RequestDraftChangesResponse> {
  try {
    const publicToken = (formData.get("publicToken") as string) || "";
    const message = ((formData.get("message") as string) || "").trim();

    if (!publicToken) return { success: false, error: "Invalid link" };
    if (!message) return { success: false, error: "Please describe the changes you'd like." };
    if (message.length > 2000) {
      return { success: false, error: "Please keep your message under 2000 characters." };
    }

    await bookingService.requestProposalChanges(publicToken, message);

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Request draft changes error:", error);
    return { success: false, error: "Failed to send your request. Please try again." };
  }
}
