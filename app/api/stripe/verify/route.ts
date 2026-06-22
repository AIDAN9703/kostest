import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { bookings, bookingStatusHistory, bookingPricing, payments, boats } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { paymentService } from "@/features/payments/payment.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import type { BookingStatus } from "@/database/types";
import { getStripe } from "@/shared/lib/services/stripe.service";
import { fulfillInstantCheckoutSession } from "@/features/bookings/services/instant-checkout-fulfillment.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/verify?session_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
      return NextResponse.json({ success: false, error: "Invalid session_id" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.status !== "complete" || session.payment_status === "unpaid") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const paymentLinkId =
      typeof session.payment_link === "string"
        ? session.payment_link
        : (session.payment_link?.id ?? null);

    let bookingId: string | null = null;

    const bySession = await db
      .select({ payableId: payments.payableId })
      .from(payments)
      .where(
        and(eq(payments.stripeCheckoutSessionId, sessionId), eq(payments.payableType, "BOOKING"))
      )
      .limit(1);
    if (bySession.length > 0) bookingId = bySession[0].payableId;

    if (!bookingId && paymentLinkId) {
      const byLink = await db
        .select({ payableId: payments.payableId })
        .from(payments)
        .where(
          and(eq(payments.stripePaymentLinkId, paymentLinkId), eq(payments.payableType, "BOOKING"))
        )
        .limit(1);
      if (byLink.length > 0) bookingId = byLink[0].payableId;
    }

    if (!bookingId && paymentIntentId) {
      const byIntent = await db
        .select({ payableId: payments.payableId })
        .from(payments)
        .where(
          and(
            eq(payments.stripePaymentIntentId, paymentIntentId),
            eq(payments.payableType, "BOOKING")
          )
        )
        .limit(1);
      if (byIntent.length > 0) bookingId = byIntent[0].payableId;
    }

    if (!bookingId) {
      const existingPayment = await paymentService.getPaymentByStripeCheckoutSessionId(sessionId);

      if (session.metadata?.bookingType === "INSTANT_BOOK") {
        const fulfillment = await fulfillInstantCheckoutSession(session, existingPayment, {
          sendConfirmationEmail: false,
        });

        if (fulfillment.status === "created" || fulfillment.status === "already_processed") {
          bookingId = fulfillment.bookingId;
        }
      }

      if (!bookingId) {
        return NextResponse.json(
          {
            success: true,
            message: "Payment successful — booking is still processing.",
          },
          { status: 202 }
        );
      }
    }

    return buildVerifyResponse(bookingId, paymentIntentId);
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

async function buildVerifyResponse(bookingId: string, paymentIntentId?: string | null) {
  const [booking] = await db
    .select({
      id: bookings.id,
      bookingStatus: bookings.bookingStatus,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.json(
      { success: true, message: "Booking is still processing." },
      { status: 202 }
    );
  }

  if (booking.bookingStatus !== "CONFIRMED") {
    await db
      .update(bookings)
      .set({ bookingStatus: "CONFIRMED", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    await db.insert(bookingStatusHistory).values({
      bookingId,
      fromStatus: booking.bookingStatus as BookingStatus,
      toStatus: "CONFIRMED",
      reason: "Payment verified",
    });
    await bookingEventsService.logStatusChange({
      bookingId,
      fromStatus: booking.bookingStatus as BookingStatus,
      toStatus: "CONFIRMED",
      actorType: "system",
      reason: "Payment verified",
      channel: "stripe",
    });
  }

  if (paymentIntentId) {
    const payment = await paymentService.getPaymentByStripeIntentId(paymentIntentId);
    if (payment && payment.status !== "SUCCEEDED") {
      await paymentService.markPaymentSucceeded(payment.id);
    }
  }

  const [details] = await db
    .select({
      id: bookings.id,
      bookingType: bookings.bookingType,
      customerName: bookings.customerName,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      totalAmountCents: bookingPricing.totalAmountCents,
      basePriceCents: bookingPricing.basePriceCents,
      cleaningFeeCents: bookingPricing.cleaningFeeCents,
      serviceFeeCents: bookingPricing.serviceFeeCents,
      captainFeeCents: bookingPricing.captainFeeCents,
      depositAmountCents: bookingPricing.depositAmountCents,
    })
    .from(bookings)
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  return NextResponse.json({
    success: true,
    bookingId,
    status: "CONFIRMED",
    booking: details
      ? {
          id: details.id,
          bookingType: details.bookingType,
          customerName: details.customerName,
          startDateTime: details.startDateTime,
          endDateTime: details.endDateTime,
          numberOfPassengers: details.numberOfPassengers,
          boatName: details.boatName,
          boatCategory: details.boatCategory,
          boatMainImage: details.boatMainImage,
          totalAmountCents: details.totalAmountCents ? Number(details.totalAmountCents) : null,
          basePriceCents: details.basePriceCents ? Number(details.basePriceCents) : null,
          cleaningFeeCents: details.cleaningFeeCents ? Number(details.cleaningFeeCents) : null,
          serviceFeeCents: details.serviceFeeCents ? Number(details.serviceFeeCents) : null,
          captainFeeCents: details.captainFeeCents ? Number(details.captainFeeCents) : null,
          depositAmountCents: details.depositAmountCents
            ? Number(details.depositAmountCents)
            : null,
        }
      : null,
  });
}
