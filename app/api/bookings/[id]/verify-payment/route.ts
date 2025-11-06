import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { bookings } from '@/database/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import config from '@/shared/config/config';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

/**
 * Verify payment status and update booking if needed
 * POST /api/bookings/[id]/verify-payment
 * 
 * This is a fallback in case the webhook hasn't fired yet.
 * Checks Stripe payment status and updates booking accordingly.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    
    // Get booking
    const bookingResults = await db
      .select({
        id: bookings.id,
        stripePaymentLinkId: bookings.stripePaymentLinkId,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        bookingStatus: bookings.bookingStatus,
        paymentStatus: bookings.paymentStatus,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);
    
    if (bookingResults.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    const booking = bookingResults[0];
    
    // If already confirmed and paid, no need to verify
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, alreadyConfirmed: true });
    }
    
    // Try to verify via payment link ID
    if (booking.stripePaymentLinkId) {
      try {
        // Retrieve the payment link
        const paymentLink = await stripe.paymentLinks.retrieve(booking.stripePaymentLinkId);
        
        // Get the latest session from the payment link
        const sessions = await stripe.checkout.sessions.list({
          payment_link: booking.stripePaymentLinkId,
          limit: 1,
        });
        
        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          
          // If session is complete, update booking
          if (session.status === 'complete' && session.payment_status === 'paid') {
            await db.update(bookings)
              .set({
                paymentStatus: 'PAID',
                bookingStatus: 'CONFIRMED',
                stripePaymentIntentId: session.payment_intent as string,
                updatedAt: new Date(),
              })
              .where(eq(bookings.id, bookingId));
            
            return NextResponse.json({ 
              success: true, 
              updated: true,
              message: 'Booking status updated to confirmed' 
            });
          }
        }
      } catch (error) {
        console.error('Error verifying payment link:', error);
      }
    }
    
    // Try to verify via payment intent ID
    if (booking.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
          await db.update(bookings)
            .set({
              paymentStatus: 'PAID',
              bookingStatus: 'CONFIRMED',
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));
          
          return NextResponse.json({ 
            success: true, 
            updated: true,
            message: 'Booking status updated to confirmed' 
          });
        }
      } catch (error) {
        console.error('Error verifying payment intent:', error);
      }
    }
    
    // Payment not found or not completed yet
    return NextResponse.json({ 
      success: true, 
      updated: false,
      message: 'Payment not yet confirmed' 
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

