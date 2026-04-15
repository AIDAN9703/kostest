"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { paymentService } from "@/features/payments/payment.service";

/**
 * Marks the charter as received in ops (PAID + client paid) and inserts a **payment** row
 * for any amount not already covered by succeeded, non-refund payments — so Total paid,
 * balance, and payment history match the ops sheet (Stripe + Zelle / offline).
 */
export async function markBookingPaidOfflineAction(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { success: false as const, error: "Admin access required" };
    }
    if (!bookingId?.trim()) {
      return { success: false as const, error: "Booking id required" };
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
        error: "Set ops GMV or ensure the booking has a quote total before marking paid.",
      };
    }

    const payments = await paymentService.getBookingPayments(bookingId);
    const recordedCents = payments.reduce((sum, p) => {
      if (p.status !== "SUCCEEDED" || p.paymentType === "REFUND") return sum;
      return sum + Number(p.amountCents);
    }, 0);

    const deltaCents = targetPaidCents - recordedCents;

    if (deltaCents > 0) {
      const paymentType =
        recordedCents === 0 ? ("FULL_PAYMENT" as const) : ("PARTIAL" as const);
      await paymentService.createPayment({
        payableType: "BOOKING",
        payableId: bookingId,
        paymentType,
        amountCents: deltaCents,
        status: "SUCCEEDED",
        paymentMethodType: "MANUAL",
        notes: "Recorded via admin — offline / Zelle (linked to ops)",
        processedAt: new Date(),
      });
    }

    await bookingOpsService.upsert(bookingId, {
      paidCents: targetPaidCents,
      clientPaid: true,
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/all");

    return { success: true as const };
  } catch (error) {
    console.error("markBookingPaidOfflineAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update payment",
    };
  }
}
