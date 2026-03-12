import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { bookings } from "@/database/schema";
import { eq } from "drizzle-orm";
import { paymentService } from "@/features/payments/payment.service";
import { getStripe } from "@/shared/lib/services/stripe.service";

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
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // If already confirmed, no need to verify
    if (booking.bookingStatus === 'CONFIRMED') {
      return NextResponse.json({ success: true, alreadyConfirmed: true });
    }
    
    // Get payments for this booking
    const bookingPayments = await paymentService.getPaymentsForPayable('BOOKING', bookingId);
    
    // Try to verify via payment link ID
    const stripe = getStripe();
    const paymentLinkPayment = bookingPayments.find(p => p.stripePaymentLinkId);
    if (paymentLinkPayment?.stripePaymentLinkId) {
      try {
        // Retrieve the payment link
        const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkPayment.stripePaymentLinkId);
        
        // Get the latest session from the payment link
        const sessions = await stripe.checkout.sessions.list({
          payment_link: paymentLinkPayment.stripePaymentLinkId,
          limit: 1,
        });
        
        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          
          // If session is complete, update booking and payment
          if (session.status === 'complete' && session.payment_status === 'paid') {
            const paymentIntentId = typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id;
            
            // Update booking status
            await db.update(bookings)
              .set({
                bookingStatus: 'CONFIRMED',
                updatedAt: new Date(),
              })
              .where(eq(bookings.id, bookingId));
            
            // Update payment status
            if (paymentLinkPayment.id && paymentIntentId) {
              await paymentService.markPaymentSucceeded(paymentLinkPayment.id, paymentIntentId);
            }
            
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
    const paymentIntentPayment = bookingPayments.find(p => p.stripePaymentIntentId);
    if (paymentIntentPayment?.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentPayment.stripePaymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
          // Update booking status
          await db.update(bookings)
            .set({
              bookingStatus: 'CONFIRMED',
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));
          
          // Update payment status if not already succeeded
          if (paymentIntentPayment.status !== 'SUCCEEDED') {
            await paymentService.markPaymentSucceeded(paymentIntentPayment.id, paymentIntentPayment.stripePaymentIntentId);
          }
          
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
    
    // Try to verify via checkout session ID (for draft booking payments)
    const checkoutSessionPayment = bookingPayments.find(p => p.stripeCheckoutSessionId);
    if (checkoutSessionPayment?.stripeCheckoutSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(checkoutSessionPayment.stripeCheckoutSessionId);
        
        if (session.status === 'complete' && session.payment_status === 'paid') {
          const paymentIntentId = typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent?.id;
          
          // Update booking status
          await db.update(bookings)
            .set({
              bookingStatus: 'CONFIRMED',
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));
          
          // Update payment status
          if (checkoutSessionPayment.id && paymentIntentId) {
            await paymentService.markPaymentSucceeded(checkoutSessionPayment.id, paymentIntentId);
          }
          
          return NextResponse.json({ 
            success: true, 
            updated: true,
            message: 'Booking status updated to confirmed' 
          });
        }
      } catch (error) {
        console.error('Error verifying checkout session:', error);
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

