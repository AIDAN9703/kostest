import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/database/db";
import { bookings, bookingStatusEnum, paymentStatusEnum } from "@/database/schema";
import { eq } from "drizzle-orm";

// Add dynamic configuration for Next.js 15
export const dynamic = 'force-dynamic';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    if (session.status !== "complete") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Find the booking that was created with this session ID
    const bookingResults = await db
      .select({
        id: bookings.id,
        status: bookings.bookingStatus,
        paymentStatus: bookings.paymentStatus,
      })
      .from(bookings)
      .where(eq(bookings.stripePaymentLinkId, sessionId));

    if (bookingResults.length === 0) {
      // Check if the booking exists by payment intent ID instead
      if (session.payment_intent) {
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
          
        const bookingsByPaymentIntent = await db
          .select({
            id: bookings.id,
            status: bookings.bookingStatus,
            paymentStatus: bookings.paymentStatus,
          })
          .from(bookings)
          .where(eq(bookings.stripePaymentIntentId, paymentIntentId));
          
        if (bookingsByPaymentIntent.length > 0) {
          const booking = bookingsByPaymentIntent[0];
          
          // If status is not already CONFIRMED, update it
          if (booking.status !== "CONFIRMED" || booking.paymentStatus !== "PAID") {
            await updateBookingStatus(booking.id);
          }
          
          return NextResponse.json({
            success: true,
            bookingId: booking.id,
            status: booking.status,
          });
        }
      }
      
      // The booking might not have been created yet via webhook
      return NextResponse.json(
        {
          success: true,
          message: "Payment successful, but booking is still processing. Please check back in a moment.",
        },
        { status: 202 }
      );
    }

    const booking = bookingResults[0];

    // If the booking exists but isn't confirmed yet, update it
    if (booking.status !== "CONFIRMED" || booking.paymentStatus !== "PAID") {
      await updateBookingStatus(booking.id);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: booking.status,
    });
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

/**
 * Update booking status to CONFIRMED and payment status to PAID
 */
async function updateBookingStatus(bookingId: string) {
  try {
    await db
      .update(bookings)
      .set({
        bookingStatus: "CONFIRMED",
        paymentStatus: "PAID",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
      
    console.log(`Updated booking ${bookingId} to CONFIRMED status`);
    return true;
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    return false;
  }
} 