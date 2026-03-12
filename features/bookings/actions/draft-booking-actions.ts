"use server";

import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/booking.service";

export interface AcceptDraftBookingResponse {
  success: boolean;
  data?: { hostedInvoiceUrl: string | null };
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

    if (!publicToken) {
      return { success: false, error: "Invalid link" };
    }

    const result = await bookingService.acceptDraftBookings({
      publicToken,
      customerNote,
      payNow,
    });

    return {
      success: true,
      data: {
        hostedInvoiceUrl: result.hostedInvoiceUrl ?? null,
      },
    };
  } catch (error) {
    console.error("Accept draft booking error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to accept draft booking",
    };
  }
}
