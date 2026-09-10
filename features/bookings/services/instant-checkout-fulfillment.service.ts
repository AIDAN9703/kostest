import type Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings, bookingStatusHistory } from "@/database/schema";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import {
  availabilityService,
  isOverlapConstraintError,
} from "@/features/availability/services/availability.service";
import { paymentService } from "@/features/payments/payment.service";
import { sendBookingConfirmationEmail } from "@/shared/lib/services/email.service";
import { alertTeam } from "@/features/bookings/lib/team-alerts";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { BookingAddOn } from "@/features/bookings/booking.types";
import type { BookingStatus } from "@/database/types";

export type InstantCheckoutFulfillmentResult =
  | { status: "created"; bookingId: string }
  | { status: "already_processed"; bookingId: string }
  | { status: "skipped"; reason: string };

async function ensureBookingBooked(bookingId: string, reason: string) {
  const [booking] = await db
    .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking || booking.bookingStatus === "BOOKED") return;

  await db
    .update(bookings)
    .set({ bookingStatus: "BOOKED", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  await db.insert(bookingStatusHistory).values({
    bookingId,
    fromStatus: booking.bookingStatus,
    toStatus: "BOOKED",
    reason,
  });

  await bookingEventsService.logStatusChange({
    bookingId,
    fromStatus: booking.bookingStatus as BookingStatus,
    toStatus: "BOOKED",
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
    try {
      await ensureBookingBooked(existingPayment.payableId, "Payment received (instant book)");
    } catch (error) {
      // A held overlap booking must not be force-booked by a webhook retry.
      if (!isOverlapConstraintError(error)) throw error;
      console.error(
        "[InstantCheckout] Confirm blocked by overlap constraint — booking stays held:",
        existingPayment.payableId
      );
    }
    if (existingPayment.status !== "SUCCEEDED" && paymentIntentId) {
      await paymentService.markPaymentSucceeded(existingPayment.id, paymentIntentId);
    }
    return { status: "already_processed", bookingId: existingPayment.payableId };
  }

  const startDateTime = new Date(metadata.startDateTime);
  const endDateTime = metadata.endDateTime ? new Date(metadata.endDateTime) : null;

  // If the slot was taken while the customer sat in Stripe checkout, their
  // money is already captured — so the booking is created as a PROPOSED
  // "overlap hold" (doesn't block the calendar, can't violate the DB
  // constraint) and flagged loudly for manual resolution: refund, move, or
  // rebook. It is NEVER silently stacked on top of another charter.
  let holdReason: string | null = null;
  if (endDateTime) {
    const availability = await availabilityService.checkTimeSlotAvailability(
      metadata.boatId,
      startDateTime,
      endDateTime
    );
    if (!availability.isAvailable) {
      holdReason =
        availability.conflicts.map((c) => c.reason).join("; ") || "slot conflict";
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

  const instantInput = {
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
  };

  let newBooking;
  try {
    newBooking = await bookingService.createInstantBooking({
      ...instantInput,
      ...(holdReason ? { holdForReview: { reason: holdReason } } : {}),
    });
  } catch (error) {
    if (!isOverlapConstraintError(error)) throw error;
    // Race loser: another booking landed between our check and this insert.
    // The DB constraint did its job — hold the paid booking instead.
    holdReason = holdReason ?? "Lost a booking race — slot was taken at payment time";
    newBooking = await bookingService.createInstantBooking({
      ...instantInput,
      holdForReview: { reason: holdReason },
    });
  }

  if (holdReason) {
    await bookingEventsService.logEvent({
      bookingId: newBooking.id,
      eventType: "booking.overlap_hold",
      actorType: "system",
      channel: "webhook",
      displayMessage:
        "⚠ Paid instant booking landed on a taken slot — held for manual resolution",
      metadata: { reason: holdReason },
    });
  }

  // A held booking is NOT booked — the customer must not get a
  // confirmation email until an admin resolves the conflict.
  if (!holdReason && options?.sendConfirmationEmail !== false) {
    const fullBooking = await bookingService.getBookingById(newBooking.id);
    if (fullBooking) {
      await sendBookingConfirmationEmail(fullBooking).catch((e) =>
        console.warn("[InstantCheckout] Confirmation email failed:", e)
      );
    }
  }

  // Team alert: an instant booking sells a slot with nobody on the desk
  // involved, and a conflict hold needs a human right now. Fires once — the
  // other of webhook/verify sees "already_processed".
  const created = await bookingService.getBookingById(newBooking.id);
  if (created) {
    await alertTeam({
      subject: holdReason
        ? `Instant booking needs attention — ${created.customerName}`
        : `Instant booking — ${created.customerName}${created.boatName ? ` · ${created.boatName}` : ""}`,
      heading: holdReason ? "Instant booking landed on a conflicting slot" : "New instant booking (paid)",
      booking: created,
      extraLines: [
        {
          label: "Paid",
          value:
            session.amount_total != null
              ? formatCentsAsCurrency(session.amount_total, {
                  currency: (session.currency ?? "usd").toUpperCase(),
                })
              : null,
        },
      ],
      note: holdReason
        ? `Slot conflict: ${holdReason}. The money is captured — refund, move, or rebook.`
        : undefined,
    });
  }

  return { status: "created", bookingId: newBooking.id };
}
