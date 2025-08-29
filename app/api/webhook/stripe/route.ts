import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { bookings, bookingTypeEnum, bookingStatusEnum } from "@/database/schema";
import { eq, or } from "drizzle-orm";
import config from "@/shared/config/config";

// Use config for Stripe configuration
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = config.stripeWebhookSecret;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    
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
    
    // Check if a booking record already exists for this session
    const existingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        or(
          eq(bookings.stripePaymentIntentId, paymentIntentId),
          eq(bookings.stripePaymentLinkId, session.id)
        )
      );
    
    if (existingBookings.length > 0) {
      // Update the existing booking's status instead of skipping
      await db.update(bookings)
        .set({ 
          paymentStatus: "PAID",
          bookingStatus: "CONFIRMED",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, existingBookings[0].id));
      
      console.log(`Updated existing booking ${existingBookings[0].id} to CONFIRMED status`);
      return;
    }
    
    // Create a new Date object for consistent timestamp format
    const now = new Date();
    
    // Create booking record with new unified datetime fields
    await db.insert(bookings).values({
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
  } catch (error) {
    console.error("Error creating booking from payment:", error);
  }
} 