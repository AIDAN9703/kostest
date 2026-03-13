import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { bookings, bookingStatusHistory, payments } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { paymentService } from "@/features/payments/payment.service";
import { bookingEventsService } from "@/features/bookings/booking-events.service";
import type { BookingStatus } from "@/database/types";
import { getStripe } from "@/shared/lib/services/stripe.service";

// Add dynamic configuration for Next.js 15
export const dynamic = "force-dynamic";

/**
 * Verify a Stripe checkout session and update booking status
 * Called by the success page to confirm payment went through
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    if (session.status !== "complete") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Find the booking that was created with this session ID (via payments table)
    // Check for checkout session ID first (draft booking payments)
    const paymentByCheckoutSession = await db
      .select({
        payableId: payments.payableId,
      })
      .from(payments)
      .where(and(
        eq(payments.stripeCheckoutSessionId, sessionId),
        eq(payments.payableType, 'BOOKING')
      ))
      .limit(1);

    let bookingId: string | null = null;
    let currentBookingStatus: string | null = null;

    if (paymentByCheckoutSession.length > 0) {
      const bookingResults = await db
        .select({
          id: bookings.id,
          bookingStatus: bookings.bookingStatus,
        })
        .from(bookings)
        .where(eq(bookings.id, paymentByCheckoutSession[0].payableId))
        .limit(1);
      
      if (bookingResults.length > 0) {
        bookingId = bookingResults[0].id;
        currentBookingStatus = bookingResults[0].bookingStatus;
      }
    } else {
      // Check for payment link ID (legacy payment links)
      const paymentByLink = await db
        .select({
          payableId: payments.payableId,
        })
        .from(payments)
        .where(and(
          eq(payments.stripePaymentLinkId, sessionId),
          eq(payments.payableType, 'BOOKING')
        ))
        .limit(1);

      if (paymentByLink.length > 0) {
        const bookingResults = await db
          .select({
            id: bookings.id,
            bookingStatus: bookings.bookingStatus,
          })
          .from(bookings)
          .where(eq(bookings.id, paymentByLink[0].payableId))
          .limit(1);
        
        if (bookingResults.length > 0) {
          bookingId = bookingResults[0].id;
          currentBookingStatus = bookingResults[0].bookingStatus;
        }
      } else if (session.payment_intent) {
        // Check if the booking exists by finding the payment with this intent ID
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;

        // Find payment by intent ID and get the booking
        const paymentResults = await db
          .select({
            payableId: payments.payableId,
            status: payments.status,
          })
          .from(payments)
          .where(and(
            eq(payments.stripePaymentIntentId, paymentIntentId),
            eq(payments.payableType, 'BOOKING')
          ))
          .limit(1);

        if (paymentResults.length > 0 && paymentResults[0].payableId) {
          const bookingByPayment = await db
            .select({
              id: bookings.id,
              bookingStatus: bookings.bookingStatus,
            })
            .from(bookings)
            .where(eq(bookings.id, paymentResults[0].payableId))
            .limit(1);

          if (bookingByPayment.length > 0) {
            bookingId = bookingByPayment[0].id;
            currentBookingStatus = bookingByPayment[0].bookingStatus;
          }
        }
      }
    }

    if (!bookingId) {
      // The booking might not have been created yet via webhook
      return NextResponse.json(
        {
          success: true,
          message: "Payment successful, but booking is still processing. Please check back in a moment.",
        },
        { status: 202 }
      );
    }

    // Get current payment status from payments table
    const [currentPayment] = await db
      .select({ status: payments.status })
      .from(payments)
      .where(and(
        eq(payments.payableType, 'BOOKING'),
        eq(payments.payableId, bookingId)
      ))
      .limit(1);

    const currentPaymentStatus = currentPayment?.status;

    // If the booking exists but isn't confirmed yet, update it
    const needsStatusUpdate = currentBookingStatus !== "CONFIRMED";
    const needsPaymentUpdate = currentPaymentStatus !== "SUCCEEDED";

    if (needsStatusUpdate) {
      // Update booking status only (payment status is in payments table)
      await db.update(bookings)
        .set({
          bookingStatus: "CONFIRMED",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId));

      // Create status history entry
      if (currentBookingStatus) {
        await db.insert(bookingStatusHistory).values({
          bookingId,
          fromStatus: currentBookingStatus as any,
          toStatus: "CONFIRMED",
          reason: "Payment verified via checkout verification",
        });
        await bookingEventsService.logStatusChange({
          bookingId,
          fromStatus: currentBookingStatus as BookingStatus,
          toStatus: "CONFIRMED",
          actorType: "system",
          reason: "Payment verified via checkout verification",
          channel: "stripe",
        });
      }
    }

    if (needsPaymentUpdate) {
      // Update payment record
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      if (paymentIntentId) {
        const payment = await paymentService.getPaymentByStripeIntentId(paymentIntentId);
        if (payment && payment.status !== 'SUCCEEDED') {
          await paymentService.markPaymentSucceeded(payment.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: "CONFIRMED",
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
