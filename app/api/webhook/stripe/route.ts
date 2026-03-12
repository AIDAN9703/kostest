import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/database/db";
import { bookings, boats, bookingStatusHistory, payments } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import config from "@/shared/lib/config";
import { ghlWebhookService } from "@/shared/lib/services/ghl-webhook.service";
import {
  getStripe,
  getInvoicePaymentIntentId,
} from "@/shared/lib/services/stripe.service";
import { bookingService } from "@/features/bookings/booking.service";
import { paymentService } from "@/features/payments/payment.service";
import { sendBookingConfirmationEmail } from "@/shared/lib/services/email.service";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";

// Prevent Next.js from parsing the body - we need raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = config.stripeWebhookSecret;

export async function POST(request: NextRequest) {
  try {
    // Get raw body - critical for signature verification
    // Use blob() approach as per official Stripe/Next.js example
    const body = await (await request.blob()).text();
    const signature = request.headers.get("stripe-signature");
    
    // Log diagnostics
    console.log(`[Webhook] === Webhook Request Received ===`);
    console.log(`[Webhook] Environment: ${process.env.NODE_ENV}`);
    console.log(`[Webhook] Signature header present: ${!!signature}`);
    console.log(`[Webhook] Body length: ${body.length} characters`);
    console.log(`[Webhook] Body preview (first 200 chars): ${body.substring(0, 200)}`);
    
    if (!signature) {
      console.error("[Webhook] Missing stripe signature header");
      return NextResponse.json(
        { success: false, error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Get both test and live webhook secrets
    const testWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const liveWebhookSecret = process.env.STRIPE_LIVE_WEBHOOK_SECRET;
    const primaryWebhookSecret = webhookSecret; // From config (based on NODE_ENV)
    
    console.log(`[Webhook] Test secret configured: ${!!testWebhookSecret} (length: ${testWebhookSecret?.length || 0})`);
    console.log(`[Webhook] Live secret configured: ${!!liveWebhookSecret} (length: ${liveWebhookSecret?.length || 0})`);
    console.log(`[Webhook] Primary secret (from config): ${primaryWebhookSecret ? 'YES' : 'NO'} (length: ${primaryWebhookSecret?.length || 0})`);
    
    // Try to detect event livemode from body before verification
    let detectedLivemode: boolean | null = null;
    try {
      const parsedBody = JSON.parse(body);
      detectedLivemode = parsedBody.livemode === true;
      console.log(`[Webhook] Detected livemode from body: ${detectedLivemode ? 'LIVE' : 'TEST'}`);
    } catch (e) {
      console.log(`[Webhook] Could not parse body to detect livemode`);
    }

    if (!testWebhookSecret && !liveWebhookSecret) {
      console.error("[Webhook] No webhook secrets configured");
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    let usedSecret: string;

    // Try primary secret first (based on NODE_ENV)
    if (primaryWebhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, primaryWebhookSecret);
        usedSecret = process.env.NODE_ENV === "development" ? "TEST" : "LIVE";
        console.log(`[Webhook] Signature verified with ${usedSecret} secret`);
        console.log(`[Webhook] Received event: ${event.type} (id: ${event.id}), livemode: ${event.livemode}`);
      } catch (primaryError) {
        // If primary fails, try the other secret
        console.log(`[Webhook] Primary secret failed, trying alternate secret...`);
        
        const alternateSecret = primaryWebhookSecret === testWebhookSecret 
          ? liveWebhookSecret 
          : testWebhookSecret;
        
        if (alternateSecret) {
          try {
            event = stripe.webhooks.constructEvent(body, signature, alternateSecret);
            usedSecret = alternateSecret === testWebhookSecret ? "TEST" : "LIVE";
            console.log(`[Webhook] Signature verified with ${usedSecret} secret (alternate)`);
            console.log(`[Webhook] Received event: ${event.type} (id: ${event.id}), livemode: ${event.livemode}`);
          } catch (alternateError) {
            console.error("[Webhook] === SIGNATURE VERIFICATION FAILED ===");
            console.error("[Webhook] Both webhook secrets failed to verify signature");
            console.error(`[Webhook] Primary secret error:`, primaryError instanceof Error ? primaryError.message : primaryError);
            console.error(`[Webhook] Alternate secret error:`, alternateError instanceof Error ? alternateError.message : alternateError);
            console.error(`[Webhook] Detected livemode: ${detectedLivemode !== null ? (detectedLivemode ? 'LIVE' : 'TEST') : 'UNKNOWN'}`);
            console.error(`[Webhook] Signature header: ${signature.substring(0, 50)}...`);
            console.error(`[Webhook] Body hash check - First 100 chars: ${body.substring(0, 100)}`);
            console.error(`[Webhook] Body hash check - Last 100 chars: ${body.substring(Math.max(0, body.length - 100))}`);
            
            // Check if body might have been modified
            try {
              const parsedBody = JSON.parse(body);
              const isTestEvent = parsedBody.livemode === false;
              console.error(`[Webhook] Event type: ${parsedBody.type || 'UNKNOWN'}`);
              console.error(`[Webhook] Event livemode: ${isTestEvent ? 'TEST' : 'LIVE'}`);
              console.error(`[Webhook] Expected secret: ${isTestEvent ? 'STRIPE_WEBHOOK_SECRET (test)' : 'STRIPE_LIVE_WEBHOOK_SECRET (live)'}`);
              console.error(`[Webhook] ACTION REQUIRED: Verify webhook secrets in Vercel match Stripe Dashboard`);
              console.error(`[Webhook] - Test webhook secret should match: Stripe Dashboard → Test Mode → Webhooks → Signing secret`);
              console.error(`[Webhook] - Live webhook secret should match: Stripe Dashboard → Live Mode → Webhooks → Signing secret`);
            } catch (parseError) {
              console.error(`[Webhook] Could not parse body for diagnostics`);
            }
            
            return NextResponse.json(
              { success: false, error: "Webhook signature verification failed" },
              { status: 400 }
            );
          }
        } else {
          console.error("[Webhook] Primary secret failed and no alternate secret available");
          return NextResponse.json(
            { success: false, error: "Webhook signature verification failed" },
            { status: 400 }
          );
        }
      }
    } else {
      // Fallback: try test, then live
      if (testWebhookSecret) {
        try {
          event = stripe.webhooks.constructEvent(body, signature, testWebhookSecret);
          usedSecret = "TEST";
          console.log(`[Webhook] Signature verified with TEST secret`);
        } catch (testError) {
          if (liveWebhookSecret) {
            try {
              event = stripe.webhooks.constructEvent(body, signature, liveWebhookSecret);
              usedSecret = "LIVE";
              console.log(`[Webhook] Signature verified with LIVE secret`);
            } catch (liveError) {
              console.error("[Webhook] Both secrets failed");
              return NextResponse.json(
                { success: false, error: "Webhook signature verification failed" },
                { status: 400 }
              );
            }
          } else {
            throw testError;
          }
        }
      } else if (liveWebhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, liveWebhookSecret);
        usedSecret = "LIVE";
        console.log(`[Webhook] Signature verified with LIVE secret`);
      } else {
        return NextResponse.json(
          { success: false, error: "No webhook secret configured" },
          { status: 500 }
        );
      }
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the session
        const metadata = session.metadata || {};
        
        console.log(`[Webhook] checkout.session.completed - Session ID: ${session.id}`);
        console.log(`[Webhook] Metadata:`, JSON.stringify(metadata, null, 2));
        console.log(`[Webhook] Payment status: ${session.payment_status}, Status: ${session.status}`);
        
        // For Payment Links, metadata might not be on the session
        // Try to get it from the payment link if session.metadata is empty
        let bookingId: string | undefined = metadata.bookingId;
        
        if (!bookingId && session.payment_link) {
          // If metadata is missing, try to find booking by payment link ID via payments table
          const paymentLinkId = typeof session.payment_link === 'string' 
            ? session.payment_link 
            : session.payment_link.id;
          
          const paymentByLink = await db
            .select({ payableId: payments.payableId })
            .from(payments)
            .where(and(
              eq(payments.stripePaymentLinkId, paymentLinkId),
              eq(payments.payableType, 'BOOKING')
            ))
            .limit(1);
          
          if (paymentByLink.length > 0) {
            bookingId = paymentByLink[0].payableId;
          }
        }
        
        // Check if this is an instant booking
        if (metadata.bookingType === "INSTANT_BOOK") {
          console.log(`[Webhook] Routing to handleInstantBookingPayment`);
          await handleInstantBookingPayment(session);
        } else if (metadata.type === 'EVENT_TICKET' && metadata.eventId) {
          console.log(`[Webhook] Routing to handleEventTicketPurchase`);
          await handleEventTicketPurchase(session);
        } else if (metadata.bookingType === "REQUEST" || bookingId) {
          // Handle payment link payment for request booking
          console.log(`[Webhook] Routing to handleRequestBookingPayment`);
          await handleRequestBookingPayment(session, bookingId);
        } else {
          console.warn(`[Webhook] No handler matched for checkout.session.completed. Metadata:`, metadata);
        }
        
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] payment_intent.succeeded - Payment Intent ID: ${paymentIntent.id}`);
        await updatePaymentStatus(paymentIntent.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] invoice.paid - Invoice ID: ${invoice.id}`);
        await handleInvoicePaid(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
        break;
    }

    console.log(`[Webhook] Successfully processed event ${event.type} (id: ${event.id})`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    if (error instanceof Error) {
      console.error("[Webhook] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook testing/debugging
 * This helps verify the webhook endpoint is accessible
 */
export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint is active",
    endpoint: "/api/webhook/stripe",
    method: "POST",
    note: "Use Stripe CLI or configure webhook in Stripe Dashboard to send events here",
  });
}

/**
 * Handle event ticket purchase from Stripe checkout
 */
async function handleEventTicketPurchase(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const eventId = metadata.eventId;
    const customerEmail = metadata.customerEmail || session.customer_details?.email || '';
    const customerName = metadata.customerName || session.customer_details?.name || '';
    
    if (!eventId || !customerEmail) {
      console.error('Missing event ID or customer email in webhook');
      return;
    }

    // Parse tickets data from metadata
    let ticketsData;
    try {
      ticketsData = JSON.parse(metadata.ticketsData || '[]');
    } catch (error) {
      console.error('Error parsing tickets data:', error);
      return;
    }

    if (!ticketsData || ticketsData.length === 0) {
      console.error('No tickets data found in metadata');
      return;
    }

    const amountPaid = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
    const confirmationCode = `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Import the tables we need
    const { eventTicketPurchases, eventTickets, ticketTiers } = await import('@/database/schema');
    const { sql } = await import('drizzle-orm');

    // Create the purchase record
    const [purchase] = await db.insert(eventTicketPurchases).values({
      eventId,
      buyerName: customerName,
      buyerEmail: customerEmail,
      totalAmount: amountPaid.toString(),
      stripePaymentIntentId: session.payment_intent as string,
      isPaid: true,
    }).returning();

    // Create individual tickets
    for (const ticketData of ticketsData) {
      // Generate individual tickets for this tier
      for (let i = 0; i < ticketData.quantity; i++) {
        const ticketCode = `${confirmationCode}-${ticketData.tierId}-${i + 1}`;
        
        await db.insert(eventTickets).values({
          purchaseId: purchase.id,
          tierId: ticketData.tierId,
          ticketCode,
          attendeeName: customerName, // Default to buyer name
        });
      }

      // Update sold quantity for this tier
      await db.update(ticketTiers)
        .set({
          soldQuantity: sql`${ticketTiers.soldQuantity} + ${ticketData.quantity}`,
        })
        .where(eq(ticketTiers.id, ticketData.tierId));
    }

    console.log(`Successfully processed event ticket purchase: ${confirmationCode}`);

  } catch (error) {
    console.error('Error processing event ticket purchase:', error);
  }
}

/**
 * Update payment status for a booking (handler for payment_intent.succeeded)
 * Payment status is stored in the payments table, not on bookings
 */
async function updatePaymentStatus(paymentIntentId: string) {
  try {
    // Update payment record in payments table
    const payment = await paymentService.getPaymentByStripeIntentId(paymentIntentId);
    if (payment && payment.status !== 'SUCCEEDED') {
      await paymentService.markPaymentSucceeded(payment.id);
      console.log(`Updated payment ${payment.id} to SUCCEEDED`);
      
      // If this payment is for a booking, update booking status to CONFIRMED
      if (payment.payableType === 'BOOKING' && payment.payableId) {
        const [currentBooking] = await db
          .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
          .from(bookings)
          .where(eq(bookings.id, payment.payableId))
          .limit(1);
        
        if (currentBooking && currentBooking.bookingStatus !== "CONFIRMED") {
          await db.update(bookings)
            .set({ 
              bookingStatus: "CONFIRMED",
              updatedAt: new Date()
            })
            .where(eq(bookings.id, currentBooking.id));
          
          // Create status history entry
          await db.insert(bookingStatusHistory).values({
            bookingId: currentBooking.id,
            fromStatus: currentBooking.bookingStatus,
            toStatus: "CONFIRMED",
            reason: "Payment received",
          });
          
          console.log(`Updated booking ${currentBooking.id} to CONFIRMED`);
        }
      }
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
  }
}

/**
 * Process a successful instant booking payment and create the booking
 */
async function handleInstantBookingPayment(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    
    // Skip if essential data is missing
    if (!metadata.boatId || !metadata.userId || !metadata.startDateTime) {
      console.error("Missing essential booking data in metadata:", metadata);
      return;
    }
    
    const paymentIntentId = session.payment_intent as string;
    
    // Check if a booking record already exists for this session (via payments table)
    const paymentByLink = await db
      .select({ payableId: payments.payableId })
      .from(payments)
      .where(and(
        eq(payments.stripePaymentLinkId, session.id),
        eq(payments.payableType, 'BOOKING')
      ))
      .limit(1);
    
    if (paymentByLink.length > 0) {
      // Update the existing booking's status (booking status only, payment in payments table)
      const bookingId = paymentByLink[0].payableId;
      
      await db.update(bookings)
        .set({ 
          bookingStatus: "CONFIRMED",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));
      
      // Update payment record if exists
      const payment = await paymentService.getPaymentByStripePaymentLinkId(session.id);
      if (payment) {
        await paymentService.markPaymentSucceeded(payment.id, paymentIntentId);
      }
      
      console.log(`Updated existing booking ${bookingId} to CONFIRMED status`);
    } else {
      // Create booking via service (single source of truth for creation logic)
      const startDateTime = new Date(metadata.startDateTime);
      const endDateTime = metadata.endDateTime ? new Date(metadata.endDateTime) : null;
      const basePriceDollars = parseFloat(metadata.basePrice || "0");
      const cleaningFeeDollars = parseFloat(metadata.cleaningFee || "0");
      const captainFeeDollars = parseFloat(metadata.captainFee || "0");
      const serviceFeeDollars = parseFloat(metadata.serviceFee || "0");
      const totalAmountDollars = parseFloat(metadata.totalAmount || "0");
      const depositAmountDollars = parseFloat(metadata.depositAmount || "0");

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
        specialRequests: metadata.specialRequests || null,
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: (session.customer as string) || undefined,
        pricingOverrideCents: {
          basePriceCents: dollarsToCents(basePriceDollars),
          cleaningFeeCents: dollarsToCents(cleaningFeeDollars),
          captainFeeCents: dollarsToCents(captainFeeDollars),
          serviceFeeCents: dollarsToCents(serviceFeeDollars),
          totalPriceCents: dollarsToCents(totalAmountDollars),
          depositAmountCents: dollarsToCents(depositAmountDollars),
        },
      });

      console.log("Successfully created booking from payment session:", newBooking.id);

      // Send confirmation email
      const fullBooking = await bookingService.getBookingById(newBooking.id);
      if (fullBooking) {
        await sendBookingConfirmationEmail(fullBooking).catch(error => {
          console.warn('Failed to send confirmation email:', error);
        });
      }
    }
    
    // Send GHL webhook after successful database operation
    await sendGHLWebhookForInstantBooking(metadata, session.id);
    
  } catch (error) {
    console.error("Error processing instant booking payment:", error);
  }
}

/**
 * Send GHL webhook for instant booking after payment confirmation
 */
async function sendGHLWebhookForInstantBooking(metadata: any, sessionId: string) {
  try {
    // Get boat details for the webhook
    const boatResults = await db
      .select({
        id: boats.id,
        name: boats.name,
        mainImage: boats.mainImage,
      })
      .from(boats)
      .where(eq(boats.id, metadata.boatId));
    
    if (boatResults.length === 0) {
      console.error("Boat not found for GHL webhook:", metadata.boatId);
      return;
    }
    
    const boat = boatResults[0];
    
    // Prepare GHL webhook data
    const ghlData = {
      name: metadata.customerName || "",
      email: metadata.customerEmail || "",
      phone: metadata.customerPhone || "",
      boat_name: boat.name,
      boat_id: boat.id,
      start_date_time: metadata.startDateTime,
      end_date_time: metadata.endDateTime,
      hours: metadata.hours || 0,
      number_of_passengers: metadata.numberOfPassengers,
      needs_captain: metadata.needsCaptain === "true",
      base_price: parseFloat(metadata.basePrice || "0"),
      cleaning_fee: parseFloat(metadata.cleaningFee || "0"),
      service_fee: parseFloat(metadata.serviceFee || "0"),
      total_amount: parseFloat(metadata.totalAmount || "0"),
      booking_id: sessionId,
      source: 'KOS Yacht Club - Instant Booking',
      submitted_at: new Date().toISOString()
    };

    // Send webhook asynchronously (don't block the response)
    ghlWebhookService.sendInstantBooking(ghlData).catch(error => {
      console.warn('GHL instant booking webhook failed:', error);
    });
    
    console.log("GHL webhook sent for instant booking:", sessionId);
  } catch (error) {
    console.error("Error sending GHL webhook for instant booking:", error);
  }
}

/**
 * Handle invoice.paid - update payment and confirm draft booking(s)
 * For draft booking groups, confirms all bookings in the group
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    if (!invoice.id) {
      console.warn("[Webhook] invoice.paid received without invoice id");
      return;
    }

    const payment = await paymentService.getPaymentByStripeInvoiceId(invoice.id);
    if (!payment) {
      console.warn(`[Webhook] No payment for invoice ${invoice.id}`);
      return;
    }

    if (payment.status === "SUCCEEDED") {
      console.log(`[Webhook] Payment ${payment.id} already SUCCEEDED`);
      return;
    }

    const paymentIntentId = await getInvoicePaymentIntentId(invoice);

    await paymentService.markPaymentSucceeded(
      payment.id,
      paymentIntentId ?? undefined
    );

    if (payment.payableType !== "BOOKING" || !payment.payableId) return;

    const [firstBooking] = await db
      .select({ id: bookings.id, bookingGroupId: bookings.bookingGroupId, bookingStatus: bookings.bookingStatus })
      .from(bookings)
      .where(eq(bookings.id, payment.payableId))
      .limit(1);

    if (!firstBooking) return;

    // Get all bookings to confirm: single booking or group (draft booking flow)
    const bookingsToConfirm = firstBooking.bookingGroupId
      ? await db
          .select({ id: bookings.id, bookingStatus: bookings.bookingStatus })
          .from(bookings)
          .where(eq(bookings.bookingGroupId, firstBooking.bookingGroupId))
      : [firstBooking];

    for (const b of bookingsToConfirm) {
      if (b.bookingStatus === "CONFIRMED") continue;
      await db
        .update(bookings)
        .set({ bookingStatus: "CONFIRMED", updatedAt: new Date() })
        .where(eq(bookings.id, b.id));
      await db.insert(bookingStatusHistory).values({
        bookingId: b.id,
        fromStatus: b.bookingStatus,
        toStatus: "CONFIRMED",
        reason: "Payment received via invoice",
      });
      const full = await bookingService.getBookingById(b.id);
      if (full) await sendBookingConfirmationEmail(full).catch(() => {});
    }

    console.log(`[Webhook] Invoice ${invoice.id} paid, ${bookingsToConfirm.length} bookings confirmed`);
  } catch (error) {
    console.error("[Webhook] handleInvoicePaid error:", error);
    throw error;
  }
}

/**
 * Handle payment for request booking (payment link)
 */
async function handleRequestBookingPayment(session: Stripe.Checkout.Session, bookingIdOverride?: string) {
  try {
    const metadata = session.metadata || {};
    let bookingId = bookingIdOverride || metadata.bookingId;
    
    if (!bookingId) {
      // Last resort: try to find booking by payment link ID
      const paymentLinkId = typeof session.payment_link === 'string' 
        ? session.payment_link 
        : session.payment_link?.id;
      
      if (paymentLinkId) {
        const paymentByLink = await db
          .select({ payableId: payments.payableId })
          .from(payments)
          .where(and(
            eq(payments.stripePaymentLinkId, paymentLinkId),
            eq(payments.payableType, 'BOOKING')
          ))
          .limit(1);
        
        if (paymentByLink.length === 0) {
          console.error("Missing booking ID in payment link metadata and could not find booking by payment link ID");
          return;
        }
        
        bookingId = paymentByLink[0].payableId;
      } else {
        console.error("Missing booking ID in payment link metadata");
        return;
      }
    }
    
    // Get the booking
    const booking = await bookingService.getBookingById(bookingId);
    
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }
    
    // Verify this is a request booking
    if (booking.bookingType !== 'REQUEST') {
      console.error(`Booking ${bookingId} is not a request booking`);
      return;
    }
    
    // Get payment intent ID
    const paymentIntentId = session.payment_intent as string;
    
    // Update booking status to CONFIRMED (payment status is in payments table)
    await db.update(bookings)
      .set({
        bookingStatus: "CONFIRMED",
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));
    
    // Create status history entry
    await db.insert(bookingStatusHistory).values({
      bookingId,
      fromStatus: booking.bookingStatus as any,
      toStatus: "CONFIRMED",
      reason: "Payment received via payment link",
    });
    
    // Update payment record if exists, or create one
    const paymentLinkId = typeof session.payment_link === 'string' 
      ? session.payment_link 
      : session.payment_link?.id;
    
    if (paymentLinkId) {
      const payment = await paymentService.getPaymentByStripePaymentLinkId(paymentLinkId);
      if (payment) {
        await paymentService.markPaymentSucceeded(payment.id, paymentIntentId);
      }
    }
    
    console.log(`Updated request booking ${bookingId} to CONFIRMED after payment`);
    
    // Send confirmation email
    const updatedBooking = await bookingService.getBookingById(bookingId);
    if (updatedBooking) {
      await sendBookingConfirmationEmail(updatedBooking).catch(error => {
        console.warn('Failed to send confirmation email:', error);
      });
    }
    
  } catch (error) {
    console.error("Error processing request booking payment:", error);
  }
}
