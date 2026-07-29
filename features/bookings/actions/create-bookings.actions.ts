"use server";

import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import { bookingService } from "@/features/bookings/services/booking.service";
import {
  createBookingsSchema,
  bookingSectionSchema,
  bookingAddOnSchema,
} from "@/features/bookings/booking.validation";
import { sendDraftBookingEmail } from "@/shared/lib/services/email.service";
import { sendSms } from "@/shared/lib/services/twilio.service";
import { getBaseUrl } from "@/shared/lib/utils/base-url";
import { ActionResponse } from "@/shared/lib/types/types";

function formatZodError(error: ZodError): string {
  const first = error.errors[0];
  if (!first) return "Validation failed";
  const path = first.path.filter(Boolean).join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

const bookingsArraySchema = bookingSectionSchema.array();
const lineItemsArraySchema = bookingAddOnSchema.array();

function parseAndValidateBookings(raw: FormDataEntryValue | null): z.infer<typeof bookingsArraySchema> {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    const result = bookingsArraySchema.safeParse(parsed);
    if (!result.success) {
      throw new ZodError(result.error.errors);
    }
    return result.data;
  } catch (err) {
    if (err instanceof ZodError) throw err;
    throw new Error("Invalid bookings data");
  }
}

function parseAndValidateLineItems(raw: FormDataEntryValue | null): z.infer<typeof lineItemsArraySchema> {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    const result = lineItemsArraySchema.safeParse(parsed);
    if (!result.success) {
      throw new ZodError(result.error.errors);
    }
    return result.data;
  } catch (err) {
    if (err instanceof ZodError) throw err;
    throw new Error("Invalid line items data");
  }
}

export async function createBookingsAction(
  _prevState: ActionResponse<{
    bookingIds: string[];
    publicToken: string | null;
    groupId: string | null;
    proposalSent?: boolean;
  }>,
  formData: FormData
): Promise<
  ActionResponse<{
    bookingIds: string[];
    publicToken: string | null;
    groupId: string | null;
    proposalSent?: boolean;
  }>
> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) {
      return { success: false, error: adminAuth.error };
    }
    const session = adminAuth.session;

    const bookingsRaw = formData.get("bookings");
    const lineItemsRaw = formData.get("lineItems");
    const sendProposalEmail = formData.get("sendProposalEmail") === "on";
    const sendProposalSms = formData.get("sendProposalSms") === "on";

    const bookingsData = parseAndValidateBookings(bookingsRaw);
    const lineItemsData = parseAndValidateLineItems(lineItemsRaw);

    const payload = createBookingsSchema.parse({
      dealId: formData.get("dealId") || null,
      numberOfPassengers: Number(formData.get("numberOfPassengers") || 0),
      pickupLocation: formData.get("pickupLocation") || null,
      dropoffLocation: formData.get("dropoffLocation") || null,
      adminNotes: formData.get("adminNotes") || null,
      bookings: bookingsData,
      lineItems: lineItemsData,
      groupName: formData.get("groupName") || null,
      allowPayment: formData.get("allowPayment") === "on",
      paymentType:
        (formData.get("paymentType") as "DEPOSIT_ONLY" | "FULL_PAYMENT") || "FULL_PAYMENT",
      sendProposalEmail,
      sendProposalSms,
    });

    const publishNow = sendProposalEmail || sendProposalSms;
    const result = await bookingService.createBookings({ ...payload, publishNow }, session.user.id);

    const baseUrl = getBaseUrl();
    const draftLink = result.publicToken ? `${baseUrl}/bookings/draft/${result.publicToken}` : null;

    if (draftLink && publishNow) {
      const first = payload.bookings[0];
      const isGroup = payload.bookings.length > 1;

      if (sendProposalEmail) {
        sendDraftBookingEmail({
          customerName: first.customerName,
          customerEmail: first.customerEmail,
          draftLink,
          isGroup,
        }).catch((err) => console.error("Draft email failed:", err));
      }

      if (sendProposalSms && first.customerPhone?.trim()) {
        sendSms(
          first.customerPhone,
          `Kings Of The Sea: Your charter proposal is ready. View & accept: ${draftLink}`
        ).catch((err) => console.error("Draft SMS failed:", err));
      }
    }

    // Every surface that shows this deal must see DRAFT, not a stale INQUIRY.
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    for (const bookingId of result.bookingIds) {
      revalidatePath(`/admin/bookings/${bookingId}`);
    }

    return {
      success: true,
      data: {
        bookingIds: result.bookingIds,
        publicToken: result.publicToken,
        groupId: result.groupId,
        proposalSent: publishNow,
      },
    };
  } catch (error) {
    console.error("Create bookings error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bookings",
    };
  }
}
