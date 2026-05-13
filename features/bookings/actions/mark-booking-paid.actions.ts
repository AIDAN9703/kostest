"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { paymentService } from "@/features/payments/payment.service";

/**
 * Records a manual (offline) payment for a booking, updates the payment ledger,
 * and syncs ops PAID + client paid when the cumulative total reaches ops GMV (or quote total).
 */
export async function recordBookingManualPaymentAction(
  bookingId: string,
  amountCents: number
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { success: false as const, error: "Admin access required" };
    }
    if (!bookingId?.trim()) {
      return { success: false as const, error: "Booking id required" };
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return {
        success: false as const,
        error: "Enter a valid payment amount greater than zero.",
      };
    }

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return { success: false as const, error: "Booking not found" };
    }

    const ops = await bookingOpsService.getByBookingId(bookingId);
    const charterTotalCents = booking.totalAmountCents ?? null;
    const targetPaidCents =
      ops?.gmvCents != null && ops.gmvCents > 0 ? ops.gmvCents : charterTotalCents;

    if (targetPaidCents == null || targetPaidCents <= 0) {
      return {
        success: false as const,
        error: "Set ops GMV or ensure the booking has a quote total before recording a payment.",
      };
    }

    const payments = await paymentService.getBookingPayments(bookingId);
    const recordedCents = payments.reduce((sum, p) => {
      if (p.status !== "SUCCEEDED" || p.paymentType === "REFUND") return sum;
      return sum + Number(p.amountCents);
    }, 0);

    const remainingCents = targetPaidCents - recordedCents;
    if (remainingCents <= 0) {
      return {
        success: false as const,
        error: "This booking has no remaining balance to record.",
      };
    }
    if (amountCents > remainingCents) {
      return {
        success: false as const,
        error: "That amount is more than the remaining balance. Refresh the page and try again.",
      };
    }

    const newRecordedTotal = recordedCents + amountCents;
    const paymentType =
      recordedCents === 0 && newRecordedTotal >= targetPaidCents
        ? ("FULL_PAYMENT" as const)
        : ("PARTIAL" as const);

    await paymentService.createPayment({
      payableType: "BOOKING",
      payableId: bookingId,
      paymentType,
      amountCents,
      status: "SUCCEEDED",
      paymentMethodType: "MANUAL",
      notes: "Recorded via admin — manual / offline payment",
      processedAt: new Date(),
    });

    await bookingOpsService.upsert(bookingId, {
      paidCents: newRecordedTotal,
      clientPaid: newRecordedTotal >= targetPaidCents,
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");

    return { success: true as const };
  } catch (error) {
    console.error("recordBookingManualPaymentAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to record payment",
    };
  }
}
