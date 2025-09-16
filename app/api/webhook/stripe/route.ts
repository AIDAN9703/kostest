import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { bookings, bookingTypeEnum, bookingStatusEnum, boats } from "@/database/schema";
import { eq, or } from "drizzle-orm";
import config from "@/shared/config/config";
import { ghlWebhookService } from "@/shared/services/ghl-webhook.service";

// Use config for Stripe configuration
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = config.stripeWebhookSecret;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    
    if (!signature || !webhookSecret) {
      console.error("Missing stripe signature or webhook secret");
      return NextResponse.json(
        { success: false, error: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { success: false, error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the session
        const metadata = session.metadata || {};
        
        // Check if this is an instant booking
        if (metadata.bookingType === "INSTANT_BOOK") {
          await handleInstantBookingPayment(session);
        }
        
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update payment status for any booking linked to this payment intent
        await updatePaymentStatus(paymentIntent.id);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Update payment status for a booking
 */
async function updatePaymentStatus(paymentIntentId: string) {
  try {
    const bookingResults = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.stripePaymentIntentId, paymentIntentId));
    
    if (bookingResults.length > 0) {
      // Update booking status
      await db.update(bookings)
        .set({ 
          paymentStatus: "PAID",
          bookingStatus: "CONFIRMED",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingResults[0].id));
      
      console.log(`Updated booking ${bookingResults[0].id} payment status to PAID`);
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
    
    // Use transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Check if a booking record already exists for this session
      const existingBookings = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(eq(bookings.stripePaymentLinkId, session.id));
      
      if (existingBookings.length > 0) {
        // Update the existing booking's status
        await tx.update(bookings)
          .set({ 
            paymentStatus: "PAID",
            bookingStatus: "CONFIRMED",
            updatedAt: new Date()
          })
          .where(eq(bookings.id, existingBookings[0].id));
        
        console.log(`Updated existing booking ${existingBookings[0].id} to CONFIRMED status`);
      } else {
        // Create a new Date object for consistent timestamp format
        const now = new Date();
         
        // Create booking record with new unified datetime fields
        await tx.insert(bookings).values({
          bookingType: "INSTANT_BOOK",
          bookingStatus: "CONFIRMED",
          userId: metadata.userId,
          boatId: metadata.boatId,
          pricingTierId: metadata.pricingTierId,
          
          // Customer information
          customerName: metadata.customerName || "",
          customerEmail: metadata.customerEmail || "",
          customerPhone: metadata.customerPhone || "",
          
          // Booking details - NEW unified datetime fields
          isMultiDay: metadata.isMultiDay === "true",
          needsCaptain: metadata.needsCaptain === "true",
          startDateTime: new Date(metadata.startDateTime),
          endDateTime: new Date(metadata.endDateTime),
          numberOfPassengers: parseInt(metadata.numberOfPassengers || "1"),
          specialRequests: metadata.specialRequests || "",
          
          // Pricing
          captainFee: parseFloat(metadata.captainFee || "0"),
          cleaningFee: parseFloat(metadata.cleaningFee || "0"),
          serviceFee: parseFloat(metadata.serviceFee || "0"),
          taxAmount: parseFloat(metadata.taxAmount || "0"),
          totalAmount: parseFloat(metadata.totalAmount || "0"),
          depositAmount: parseFloat(metadata.depositAmount || "0"),
          currency: "USD",
          
          // Payment information
          paymentStatus: "PAID",
          paymentMethod: "card",
          stripeCustomerId: session.customer as string,
          stripePaymentIntentId: paymentIntentId,
          stripePaymentLinkId: session.id,
          
          // Timestamps - use the same format for all bookings
          createdAt: now,
          updatedAt: now
        });
        
        console.log("Successfully created booking from payment session:", session.id);
      }
    });
    
    // Send GHL webhook after successful database transaction
    // This is outside the transaction to avoid blocking on external API calls
    await sendGHLWebhookForInstantBooking(metadata, session.id);
    
  } catch (error) {
    console.error("Error processing instant booking payment:", error);
    // Transaction will automatically rollback on error
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
