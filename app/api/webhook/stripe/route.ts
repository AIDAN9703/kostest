import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/database/db";
import { bookings, boats, bookingStatusHistory, payments } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import config from "@/shared/lib/config";
import { ghlWebhookService } from "@/shared/lib/services/ghl-webhook.service";
import { getStripe, getInvoicePaymentIntentId } from "@/shared/lib/services/stripe.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { paymentService } from "@/features/payments/payment.service";
import { sendBookingConfirmationEmail } from "@/shared/lib/services/email.service";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = config.stripeWebhookSecret;

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await (await request.blob()).text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    const event = verifyWebhookSignature(body, signature);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] ${event.type} (id: ${event.id}, livemode: ${event.livemode})`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint is active",
    endpoint: "/api/webhook/stripe",
    method: "POST",
  });
}

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

function verifyWebhookSignature(body: string, signature: string): Stripe.Event | null {
  const stripe = getStripe();
  const testSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const liveSecret = process.env.STRIPE_LIVE_WEBHOOK_SECRET;

  const secretsToTry = [
    webhookSecret,
    webhookSecret === testSecret ? liveSecret : testSecret,
  ].filter(Boolean) as string[];

  for (const secret of secretsToTry) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch {
      // Try next secret
    }
  }

  console.error("[Webhook] All webhook secrets failed signature verification");
  return null;
}

// ============================================================================
// checkout.session.completed — SINGLE HANDLER FOR ALL CHECKOUT FLOWS
// ============================================================================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  // --- Idempotency: check if we already have a SUCCEEDED payment for this session ---
  const existingPayment = await paymentService.getPaymentByStripeCheckoutSessionId(session.id);
  if (existingPayment?.status === "SUCCEEDED") {
    console.log(`[Webhook] Session ${session.id} already processed — skipping`);
    return;
  }

  // --- Route by booking type ---
  if (metadata.bookingType === "INSTANT_BOOK") {
    await handleInstantBooking(session, existingPayment);
  } else if (metadata.type === "EVENT_TICKET" && metadata.eventId) {
    await handleEventTicketPurchase(session);
  } else {
    // Request bookings, draft pay-now, or payment link flows
    await handleBookingPayment(session, existingPayment);
  }
}

// ============================================================================
// INSTANT BOOKING
// ============================================================================

async function handleInstantBooking(
  session: Stripe.Checkout.Session,
  existingPayment: Awaited<ReturnType<typeof paymentService.getPaymentByStripeCheckoutSessionId>>
) {
  try {
    const metadata = session.metadata || {};

    if (!metadata.boatId || !metadata.userId || !metadata.startDateTime) {
      console.error("[Webhook] Missing essential instant booking data in metadata");
      return;
    }

    const paymentIntentId = session.payment_intent as string;

    // Idempotency: if a payment record already exists for this checkout session,
    // just ensure the booking + payment are confirmed/succeeded.
    if (existingPayment) {
      await ensureBookingConfirmed(existingPayment.payableId, "Payment received (instant book)");
      if (existingPayment.status !== "SUCCEEDED") {
        await paymentService.markPaymentSucceeded(existingPayment.id, paymentIntentId);
      }
      console.log(`[Webhook] Idempotent update for instant booking, payment ${existingPayment.id}`);
      await sendGHLWebhookForInstantBooking(metadata, session.id);
      return;
    }

    // Create booking + payment record via service
    const startDateTime = new Date(metadata.startDateTime);
    const endDateTime = metadata.endDateTime ? new Date(metadata.endDateTime) : null;

    const newBooking = await bookingService.createInstantBooking({
      boatId: metadata.boatId,
      pricingTierId: metadata.pricingTierId || null,
      userId: metadata.userId,
      customerName: metadata.customerName || "",
      customerEmail: metadata.customerEmail || "",
      customerPhone: metadata.customerPhone || "",
      startDateTime,
      endDateTime,
      numberOfPassengers: parseInt(metadata.numberOfPassengers || "1"),
      needsCaptain: metadata.needsCaptain === "true",
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: (session.customer as string) || undefined,
      pricingOverrideCents: {
        basePriceCents: dollarsToCents(parseFloat(metadata.basePrice || "0")),
        cleaningFeeCents: dollarsToCents(parseFloat(metadata.cleaningFee || "0")),
        captainFeeCents: dollarsToCents(parseFloat(metadata.captainFee || "0")),
        serviceFeeCents: dollarsToCents(parseFloat(metadata.serviceFee || "0")),
        totalPriceCents: dollarsToCents(parseFloat(metadata.totalAmount || "0")),
        depositAmountCents: dollarsToCents(parseFloat(metadata.depositAmount || "0")),
      },
    });

    console.log(`[Webhook] Created instant booking ${newBooking.id}`);

    const fullBooking = await bookingService.getBookingById(newBooking.id);
    if (fullBooking) {
      await sendBookingConfirmationEmail(fullBooking).catch((e) =>
        console.warn("[Webhook] Confirmation email failed:", e)
      );
    }

    await sendGHLWebhookForInstantBooking(metadata, session.id);
  } catch (error) {
    console.error("[Webhook] handleInstantBooking error:", error);
  }
}

// ============================================================================
// BOOKING PAYMENT (request bookings, draft pay-now, any checkout-based payment)
// ============================================================================

async function handleBookingPayment(
  session: Stripe.Checkout.Session,
  existingPayment: Awaited<ReturnType<typeof paymentService.getPaymentByStripeCheckoutSessionId>>
) {
  try {
    const metadata = session.metadata || {};
    const paymentIntentId = session.payment_intent as string;

    // Resolve booking ID from multiple sources
    let bookingId: string | undefined = metadata.bookingId;

    // Fallback: look up from existing payment record (matched by checkout session)
    if (!bookingId && existingPayment) {
      bookingId = existingPayment.payableId;
    }

    // Fallback: look up by payment link ID (legacy Payment Link flows)
    if (!bookingId && session.payment_link) {
      const paymentLinkId =
        typeof session.payment_link === "string" ? session.payment_link : session.payment_link.id;

      const byLink = await db
        .select({ payableId: payments.payableId })
        .from(payments)
        .where(
          and(eq(payments.stripePaymentLinkId, paymentLinkId), eq(payments.payableType, "BOOKING"))
        )
        .limit(1);

      if (byLink.length > 0) bookingId = byLink[0].payableId;
    }

    if (!bookingId) {
      console.warn("[Webhook] Could not resolve bookingId for checkout session", session.id);
      return;
    }

    // Confirm the booking
    await ensureBookingConfirmed(bookingId, "Payment received");

    // Update or backfill the payment record
    if (existingPayment) {
      if (existingPayment.status !== "SUCCEEDED") {
        await paymentService.markPaymentSucceeded(existingPayment.id, paymentIntentId);
      }
      // Backfill checkout session ID if missing (e.g. legacy Payment Link records)
      if (!existingPayment.stripeCheckoutSessionId) {
        await paymentService.updatePayment(existingPayment.id, {
          stripeCheckoutSessionId: session.id,
        });
      }
    } else {
      // Legacy fallback: look up payment by payment link ID
      const paymentLinkId =
        typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;

      if (paymentLinkId) {
        const linkPayment = await paymentService.getPaymentByStripePaymentLinkId(paymentLinkId);
        if (linkPayment) {
          await paymentService.markPaymentSucceeded(linkPayment.id, paymentIntentId);
          await paymentService.updatePayment(linkPayment.id, {
            stripeCheckoutSessionId: session.id,
          });
        }
      }
    }

    console.log(`[Webhook] Booking ${bookingId} confirmed via checkout`);

    // Send confirmation email
    const booking = await bookingService.getBookingById(bookingId);
    if (booking) {
      await sendBookingConfirmationEmail(booking).catch((e) =>
        console.warn("[Webhook] Confirmation email failed:", e)
      );
    }
  } catch (error) {
    console.error("[Webhook] handleBookingPayment error:", error);
  }
}

// ============================================================================
// INVOICE PAID (pay-later invoice flow)
// ============================================================================

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    if (!invoice.id) return;

    const payment = await paymentService.getPaymentByStripeInvoiceId(invoice.id);
    if (!payment) {
      console.warn(`[Webhook] No payment for invoice ${invoice.id}`);
      return;
    }

    // Idempotency
    if (payment.status === "SUCCEEDED") {
      console.log(`[Webhook] Invoice ${invoice.id} already processed`);
      return;
    }

    const paymentIntentId = await getInvoicePaymentIntentId(invoice);
    await paymentService.markPaymentSucceeded(payment.id, paymentIntentId ?? undefined);

    if (payment.payableType !== "BOOKING" || !payment.payableId) return;

    // Get the booking and its group (draft booking flow can have multiple bookings)
    const [firstBooking] = await db
      .select({
        id: bookings.id,
        bookingGroupId: bookings.bookingGroupId,
      })
      .from(bookings)
      .where(eq(bookings.id, payment.payableId))
      .limit(1);

    if (!firstBooking) return;

    const bookingsToConfirm = firstBooking.bookingGroupId
      ? await db
          .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
          .from(bookings)
          .where(eq(bookings.bookingGroupId, firstBooking.bookingGroupId))
      : await db
          .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
          .from(bookings)
          .where(eq(bookings.id, firstBooking.id));

    for (const b of bookingsToConfirm) {
      await ensureBookingConfirmed(b.id, "Payment received via invoice");
      const full = await bookingService.getBookingById(b.id);
      if (full) {
        await sendBookingConfirmationEmail(full).catch(() => {});
      }
    }

    console.log(
      `[Webhook] Invoice ${invoice.id} paid — ${bookingsToConfirm.length} booking(s) confirmed`
    );
  } catch (error) {
    console.error("[Webhook] handleInvoicePaid error:", error);
    throw error; // Rethrow so Stripe retries
  }
}

// ============================================================================
// CHARGE REFUNDED
// ============================================================================

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.warn("[Webhook] charge.refunded: no payment_intent on charge");
      return;
    }

    const payment = await paymentService.getPaymentByStripeIntentId(paymentIntentId);
    if (!payment) {
      console.warn(`[Webhook] charge.refunded: no payment for intent ${paymentIntentId}`);
      return;
    }

    if (charge.refunded) {
      // Full refund
      await paymentService.markPaymentRefunded(payment.id);

      // Update booking status to REFUNDED
      if (payment.payableType === "BOOKING" && payment.payableId) {
        const [booking] = await db
          .select({
            id: bookings.id,
            bookingStatus: bookings.bookingStatus,
          })
          .from(bookings)
          .where(eq(bookings.id, payment.payableId))
          .limit(1);

        if (booking && booking.bookingStatus !== "CANCELLED") {
          const reason = "Full refund processed via Stripe";
          await db
            .update(bookings)
            .set({
              bookingStatus: "CANCELLED",
              cancellationReason: reason,
              cancelledAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, booking.id));
          await db.insert(bookingStatusHistory).values({
            bookingId: booking.id,
            fromStatus: booking.bookingStatus,
            toStatus: "CANCELLED",
            reason,
          });
          await bookingEventsService.logStatusChange({
            bookingId: booking.id,
            fromStatus: booking.bookingStatus as any,
            toStatus: "CANCELLED",
            actorType: "system",
            reason,
            channel: "stripe",
          });
        }
      }

      console.log(`[Webhook] Full refund for payment ${payment.id}`);
    } else {
      // Partial refund
      await paymentService.createRefund(
        payment.payableType as "BOOKING" | "EVENT_TICKET",
        payment.payableId,
        charge.amount_refunded,
        {
          stripePaymentIntentId: paymentIntentId,
          notes: "Partial refund synced from Stripe",
        }
      );
      console.log(
        `[Webhook] Partial refund (${charge.amount_refunded} cents) for payment ${payment.id}`
      );
    }
  } catch (error) {
    console.error("[Webhook] handleChargeRefunded error:", error);
  }
}

// ============================================================================
// EVENT TICKET PURCHASE
// ============================================================================

async function handleEventTicketPurchase(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const eventId = metadata.eventId;
    const customerEmail = metadata.customerEmail || session.customer_details?.email || "";
    const customerName = metadata.customerName || session.customer_details?.name || "";

    if (!eventId || !customerEmail) {
      console.error("[Webhook] Missing event ID or customer email");
      return;
    }

    let ticketsData;
    try {
      ticketsData = JSON.parse(metadata.ticketsData || "[]");
    } catch {
      console.error("[Webhook] Invalid ticketsData JSON");
      return;
    }

    if (!ticketsData?.length) return;

    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
    const confirmationCode = `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { eventTicketPurchases, eventTickets, ticketTiers } = await import("@/database/schema");
    const { sql } = await import("drizzle-orm");

    // Idempotency: check for existing purchase by payment intent
    const existingPurchase = await db
      .select({ id: eventTicketPurchases.id })
      .from(eventTicketPurchases)
      .where(eq(eventTicketPurchases.stripePaymentIntentId, session.payment_intent as string))
      .limit(1);

    if (existingPurchase.length > 0) {
      console.log(
        `[Webhook] Event ticket purchase already exists for intent ${session.payment_intent}`
      );
      return;
    }

    const [purchase] = await db
      .insert(eventTicketPurchases)
      .values({
        eventId,
        buyerName: customerName,
        buyerEmail: customerEmail,
        totalAmount: amountPaid.toString(),
        stripePaymentIntentId: session.payment_intent as string,
        isPaid: true,
      })
      .returning();

    for (const ticketData of ticketsData) {
      for (let i = 0; i < ticketData.quantity; i++) {
        await db.insert(eventTickets).values({
          purchaseId: purchase.id,
          tierId: ticketData.tierId,
          ticketCode: `${confirmationCode}-${ticketData.tierId}-${i + 1}`,
          attendeeName: customerName,
        });
      }
      await db
        .update(ticketTiers)
        .set({
          soldQuantity: sql`${ticketTiers.soldQuantity} + ${ticketData.quantity}`,
        })
        .where(eq(ticketTiers.id, ticketData.tierId));
    }

    console.log(`[Webhook] Event ticket purchase created: ${confirmationCode}`);
  } catch (error) {
    console.error("[Webhook] handleEventTicketPurchase error:", error);
  }
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

/**
 * Idempotently set a booking to CONFIRMED with status history + event log.
 */
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
    fromStatus: booking.bookingStatus as any,
    toStatus: "CONFIRMED",
    actorType: "system",
    reason,
    channel: "stripe",
  });
}

async function sendGHLWebhookForInstantBooking(
  metadata: Record<string, string>,
  sessionId: string
) {
  try {
    const [boat] = await db
      .select({ id: boats.id, name: boats.name, mainImage: boats.mainImage })
      .from(boats)
      .where(eq(boats.id, metadata.boatId));

    if (!boat) return;

    ghlWebhookService
      .sendInstantBooking({
        name: metadata.customerName || "",
        email: metadata.customerEmail || "",
        phone: metadata.customerPhone || "",
        boat_name: boat.name,
        boat_id: boat.id,
        start_date_time: metadata.startDateTime,
        end_date_time: metadata.endDateTime,
        hours: metadata.hours || "0",
        number_of_passengers: metadata.numberOfPassengers,
        needs_captain: metadata.needsCaptain === "true",
        base_price: parseFloat(metadata.basePrice || "0"),
        cleaning_fee: parseFloat(metadata.cleaningFee || "0"),
        service_fee: parseFloat(metadata.serviceFee || "0"),
        total_amount: parseFloat(metadata.totalAmount || "0"),
        booking_id: sessionId,
        source: "KOS Yacht Club - Instant Booking",
        submitted_at: new Date().toISOString(),
      })
      .catch((e) => console.warn("[Webhook] GHL webhook failed:", e));
  } catch (error) {
    console.error("[Webhook] GHL webhook error:", error);
  }
}
