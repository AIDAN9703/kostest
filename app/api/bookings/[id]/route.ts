import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/db";
import { bookings } from "@/database/schema";
import { eq } from "drizzle-orm";
import { bookingService } from "@/features/bookings/services/booking.service";
import { paymentService } from "@/features/payments/payment.service";
import { apiSuccess, apiError } from "@/shared/lib/utils/api-helpers";

/**
 * Customer-facing API endpoint to fetch booking details
 * GET /api/bookings/[id]
 *
 * Allows authenticated users to fetch their own bookings.
 * Also allows unauthenticated access if the booking was just paid (for payment success page).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    // Get booking details directly from database to check source
    const [bookingRow] = await db
      .select({
        id: bookings.id,
        bookingStatus: bookings.bookingStatus,
        source: bookings.source,
        userId: bookings.userId,
        customerEmail: bookings.customerEmail,
      })
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!bookingRow) {
      return apiError("Booking not found", 404);
    }

    // Get full booking details
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    // If user is authenticated, verify they own the booking
    if (session?.user) {
      const userOwnsBooking =
        booking.userId === session.user.id ||
        booking.userEmail === session.user.email ||
        booking.customerEmail === session.user.email;

      if (!userOwnsBooking && !session.user.isAdmin) {
        return apiError("Unauthorized: You can only view your own bookings", 403);
      }
    } else {
      // For unauthenticated access (payment success page), allow if:
      // 1. Booking is confirmed (status is CONFIRMED) - payment was processed
      // 2. Or there's a successful payment in the payments table
      const isConfirmed = bookingRow.bookingStatus === "CONFIRMED";

      if (!isConfirmed) {
        try {
          const payments = await paymentService.getPaymentsForPayable("BOOKING", id);
          const hasSuccessfulPayment = payments.some((p) => p.status === "SUCCEEDED");
          if (!hasSuccessfulPayment) {
            return apiError("Authentication required", 401);
          }
        } catch {
          return apiError("Authentication required", 401);
        }
      }
    }

    return apiSuccess(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return apiError("Failed to fetch booking");
  }
}
