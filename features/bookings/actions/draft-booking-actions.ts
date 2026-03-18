"use server";

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
