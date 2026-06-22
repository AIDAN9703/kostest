import type Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings, bookingStatusHistory } from "@/database/schema";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { AvailabilityService } from "@/features/availability/services/availability.service";
import { paymentService } from "@/features/payments/payment.service";
import { sendBookingConfirmationEmail } from "@/shared/lib/services/email.service";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { BookingAddOn } from "@/features/bookings/booking.types";
import type { BookingStatus } from "@/database/types";

export type InstantCheckoutFulfillmentResult =
  | { status: "created"; bookingId: string }
  | { status: "already_processed"; bookingId: string }
  | { status: "skipped"; reason: string };

async function ensureBookingConfirmed(bookingId: string, reason: string) {
  const [booking] = await db
    .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking || booking.bookingStatus === "CONFIRMED") return;

  await db
    .update(bookings)
    .set({ bookingStatus: "CONFIRMED", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  await db.insert(bookingStatusHistory).values({
    bookingId,
    fromStatus: booking.bookingStatus,
    toStatus: "CONFIRMED",
    reason,
  });

  await bookingEventsService.logStatusChange({
    bookingId,
    fromStatus: booking.bookingStatus as BookingStatus,
    toStatus: "CONFIRMED",
    actorType: "system",
    reason,
    channel: "stripe",
  });
}

/**
 * Create (or idempotently confirm) an instant-booking from a paid Stripe Checkout
 * session. Shared by the webhook handler and the success-page verify fallback.
 */
export async function fulfillInstantCheckoutSession(
  session: Stripe.Checkout.Session,
  existingPayment: Awaited<
    ReturnType<typeof paymentService.getPaymentByStripeCheckoutSessionId>
  >,
  options?: { sendConfirmationEmail?: boolean }
): Promise<InstantCheckoutFulfillmentResult> {
  const metadata = session.metadata || {};

  if (metadata.bookingType !== "INSTANT_BOOK") {
    return { status: "skipped", reason: "Not an instant booking session" };
  }

  if (!metadata.boatId || !metadata.userId || !metadata.startDateTime) {
    return { status: "skipped", reason: "Missing instant booking metadata" };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  if (existingPayment) {
    await ensureBookingConfirmed(existingPayment.payableId, "Payment received (instant book)");
    if (existingPayment.status !== "SUCCEEDED" && paymentIntentId) {
      await paymentService.markPaymentSucceeded(existingPayment.id, paymentIntentId);
    }
    return { status: "already_processed", bookingId: existingPayment.payableId };
  }

  const startDateTime = new Date(metadata.startDateTime);
  const endDateTime = metadata.endDateTime ? new Date(metadata.endDateTime) : null;

  if (endDateTime) {
    const availability = await new AvailabilityService().checkTimeSlotAvailability(
      metadata.boatId,
      startDateTime,
      endDateTime
    );
    if (!availability.isAvailable) {
      console.error(
        `[InstantCheckout] OVERLAP: boat ${metadata.boatId} ` +
          `(${metadata.startDateTime} – ${metadata.endDateTime}) — paid booking needs manual resolution.`
      );
    }
  }

  let addOnSnapshot: BookingAddOn[] | undefined;
  if (metadata.addOns) {
    try {
      addOnSnapshot = JSON.parse(metadata.addOns);
    } catch {
      addOnSnapshot = undefined;
    }
  }

  const newBooking = await bookingService.createInstantBooking({
    boatId: metadata.boatId,
    pricingTierId: metadata.pricingTierId || null,
    userId: metadata.userId,
    customerName: metadata.customerName || "",
    customerEmail: metadata.customerEmail || "",
    customerPhone: metadata.customerPhone || "",
    startDateTime,
    endDateTime,
    numberOfPassengers: parseInt(metadata.numberOfPassengers || "1", 10),
    needsCaptain: metadata.needsCaptain === "true",
    stripePaymentIntentId: paymentIntentId ?? undefined,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: (session.customer as string) || undefined,
    addOns: addOnSnapshot,
    pricingOverrideCents: {
      basePriceCents: dollarsToCents(parseFloat(metadata.basePrice || "0")),
      cleaningFeeCents: dollarsToCents(parseFloat(metadata.cleaningFee || "0")),
      captainFeeCents: dollarsToCents(parseFloat(metadata.captainFee || "0")),
      serviceFeeCents: dollarsToCents(parseFloat(metadata.serviceFee || "0")),
      totalPriceCents: dollarsToCents(parseFloat(metadata.totalAmount || "0")),
      depositAmountCents: dollarsToCents(parseFloat(metadata.depositAmount || "0")),
    },
  });

  if (options?.sendConfirmationEmail !== false) {
    const fullBooking = await bookingService.getBookingById(newBooking.id);
    if (fullBooking) {
      await sendBookingConfirmationEmail(fullBooking).catch((e) =>
        console.warn("[InstantCheckout] Confirmation email failed:", e)
      );
    }
  }

  return { status: "created", bookingId: newBooking.id };
}
