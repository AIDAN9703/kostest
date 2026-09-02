"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookingPricing } from "@/database/schema";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";
import { effectiveTotalCents } from "@/features/bookings/lib/booking-money";
import { MANUAL_PAYMENT_METHOD_LABELS, type ManualPaymentMethod } from "@/features/bookings/lib/manual-payment";
import { paymentService } from "@/features/payments/payment.service";

/**
 * Records an off-platform payment. Optionally waives the card-processing fee
 * (the fee is a cost of paying by card — a Zelle payer never owed it), which
 * lowers the effective total so "paid in full" means what the customer
 * actually paid. Syncs ops PAID / client-paid against the effective total.
 */
export async function recordBookingManualPaymentAction(
  bookingId: string,
  input: { amountCents: number; method: ManualPaymentMethod; waiveServiceFee: boolean }
) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error !== undefined) return { success: false as const, error: authResult.error };
    const { amountCents, method, waiveServiceFee } = input;

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return { success: false as const, error: "Enter a valid payment amount greater than zero." };
    }

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) return { success: false as const, error: "Booking not found" };
    if ((booking.totalAmountCents ?? 0) <= 0) {
      return { success: false as const, error: "Price the booking before recording a payment." };
    }

    // Waive first so the remaining-balance math below sees the new total.
    const waived = booking.serviceFeeWaived || waiveServiceFee;
    if (waiveServiceFee && !booking.serviceFeeWaived) {
      await db
        .update(bookingPricing)
        .set({ serviceFeeWaived: true })
        .where(eq(bookingPricing.bookingId, bookingId));
    }

    const targetCents = effectiveTotalCents({ ...booking, serviceFeeWaived: waived });
    const payments = await paymentService.getBookingPayments(bookingId);
    const recordedCents = payments.reduce(
      (sum, p) => (p.status !== "SUCCEEDED" || p.paymentType === "REFUND" ? sum : sum + Number(p.amountCents)),
      0
    );
    const remainingCents = targetCents - recordedCents;
    if (remainingCents <= 0) {
      return { success: false as const, error: "This booking has no remaining balance to record." };
    }
    if (amountCents > remainingCents) {
      return {
        success: false as const,
        error: "That amount is more than the remaining balance. Refresh the page and try again.",
      };
    }

    const newRecordedTotal = recordedCents + amountCents;
    await paymentService.createPayment({
      payableType: "BOOKING",
      payableId: bookingId,
      paymentType: recordedCents === 0 && newRecordedTotal >= targetCents ? "FULL_PAYMENT" : "PARTIAL",
      amountCents,
      status: "SUCCEEDED",
      paymentMethodType: "MANUAL",
      paymentMethodDetail: MANUAL_PAYMENT_METHOD_LABELS[method],
      notes: `Recorded via admin — ${MANUAL_PAYMENT_METHOD_LABELS[method]}${waiveServiceFee ? ", card fee waived" : ""}`,
      processedAt: new Date(),
    });

    await bookingOpsService.upsert(bookingId, {
      paidCents: newRecordedTotal,
      clientPaid: newRecordedTotal >= targetCents,
    });

    if (waiveServiceFee && !booking.serviceFeeWaived) {
      await bookingEventsService.logEvent({
        bookingId,
        eventType: BOOKING_EVENT_TYPES.UPDATED,
        actorType: "admin",
        actorId: authResult.session.user.id,
        channel: "admin_portal",
        displayMessage: `Card fee waived — paid by ${MANUAL_PAYMENT_METHOD_LABELS[method]}`,
      });
    }

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    return { success: true as const };
  } catch (error) {
    console.error("recordBookingManualPaymentAction:", error);
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to record payment" };
  }
}
