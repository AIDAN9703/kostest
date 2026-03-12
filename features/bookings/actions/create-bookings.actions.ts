"use server";

import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/booking.service";
import { createBookingsSchema } from "@/features/bookings/booking.validation";
import { markInquiryAsConverted } from "@/features/inquiries/inquiry.actions";
import { sendDraftBookingEmail } from "@/shared/lib/services/email.service";
import { sendSms } from "@/shared/lib/services/twilio.service";

function toIsoOrNull(raw: FormDataEntryValue | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseJson<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (!raw || typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface CreateBookingsResponse {
  success: boolean;
  data?: {
    bookingIds: string[];
    publicToken: string | null;
    groupId: string | null;
  };
  error?: string;
}

export async function createBookingsAction(
  _prevState: CreateBookingsResponse,
  formData: FormData
): Promise<CreateBookingsResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const bookingsRaw = formData.get("bookings");
    const lineItemsRaw = formData.get("lineItems");
    const expiresAtRaw = formData.get("expiresAt") as string | null;

    const bookingsData = parseJson<
      Array<{
        boatId: string;
        pricingTierId?: string | null;
        basePrice: number;
        depositAmount?: number | null;
        customerName: string;
        customerEmail: string;
        customerPhone?: string | null;
        userId?: string | null;
        startDateTime: string;
        endDateTime?: string | null;
      }>
    >(bookingsRaw, []);

    const payload = createBookingsSchema.parse({
      numberOfPassengers: Number(formData.get("numberOfPassengers") || 0),
      pickupLocation: formData.get("pickupLocation") || null,
      dropoffLocation: formData.get("dropoffLocation") || null,
      specialRequests: formData.get("specialRequests") || null,
      adminNotes: formData.get("adminNotes") || null,
      inquiryId: formData.get("inquiryId") || null,
      bookings: bookingsData,
      lineItems: parseJson(lineItemsRaw, []),
      groupName: formData.get("groupName") || null,
      allowPayment: formData.get("allowPayment") === "on",
      paymentType:
        (formData.get("paymentType") as "DEPOSIT_ONLY" | "FULL_PAYMENT") ||
        "FULL_PAYMENT",
      expiresAt: toIsoOrNull(expiresAtRaw),
    });

    const result = await bookingService.createBookings(
      payload,
      session.user.id
    );

    if (payload.inquiryId) {
      await markInquiryAsConverted(payload.inquiryId);
    }

    // Auto-send draft proposal to customer (email + SMS)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kosyachts.com";
    const draftLink = result.publicToken
      ? `${baseUrl}/bookings/draft/${result.publicToken}`
      : null;

    if (draftLink) {
      const first = payload.bookings[0];
      const isGroup = payload.bookings.length > 1;

      // Email
      sendDraftBookingEmail({
        customerName: first.customerName,
        customerEmail: first.customerEmail,
        draftLink,
        isGroup,
      }).catch((err) => console.error("Draft email failed:", err));

      // SMS (if phone provided)
      if (first.customerPhone?.trim()) {
        sendSms(
          first.customerPhone,
          `Kings Of The Sea: Your charter proposal is ready. View & accept: ${draftLink}`
        ).catch((err) => console.error("Draft SMS failed:", err));
      }
    }

    return {
      success: true,
      data: {
        bookingIds: result.bookingIds,
        publicToken: result.publicToken,
        groupId: result.groupId,
      },
    };
  } catch (error) {
    console.error("Create bookings error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create bookings",
    };
  }
}
