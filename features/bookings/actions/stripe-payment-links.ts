/**
 * Stripe Payment Link Generation
 * Creates payment links for request bookings that need approval
 */

import Stripe from 'stripe';
import { bookingService } from '@/features/bookings/booking.service';
import { getBaseUrl } from '@/shared/utils/base-url';

// Initialize Stripe
const stripe = new Stripe(
  process.env.NODE_ENV === 'development'
    ? process.env.STRIPE_SECRET_KEY!
    : process.env.STRIPE_LIVE_SECRET_KEY!,
  {
    apiVersion: '2025-07-30.basil',
  }
);

/**
 * Create a Stripe payment link for a booking request
 * This is used when admin approves a booking request
 */
export async function createPaymentLinkForBooking(bookingId: string): Promise<string> {
  // Get booking details
  const booking = await bookingService.getBookingById(bookingId);
  
  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  if (!booking.totalAmount || booking.totalAmount <= 0) {
    throw new Error(`Invalid booking amount: ${booking.totalAmount}`);
  }

  const baseUrl = getBaseUrl();

  // Create Stripe payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Booking for ${booking.boatName || 'Boat'}`,
            description: `Booking date: ${booking.startDateTime.toLocaleDateString()}`,
          },
          unit_amount: Math.round(booking.totalAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: bookingId,
      bookingType: 'REQUEST',
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${baseUrl}/bookings/payment-success/${bookingId}`,
      },
    },
    // Note: Payment Links don't support expires_at in the API version we're using
    // We'll handle expiration in our application logic instead
  });

  // Store payment link ID in booking
  await bookingService.updatePaymentLinkId(bookingId, paymentLink.id);

  return paymentLink.url;
}

/**
 * Get payment link status from Stripe
 */
export async function getPaymentLinkStatus(paymentLinkId: string): Promise<{
  active: boolean;
}> {
  try {
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
    
    return {
      active: paymentLink.active,
    };
  } catch (error) {
    console.error('Error retrieving payment link status:', error);
    return {
      active: false,
    };
  }
}

