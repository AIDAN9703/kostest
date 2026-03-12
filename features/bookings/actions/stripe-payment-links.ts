/**
 * Stripe Payment Link Generation
 * Creates payment links for request bookings that need approval
 *
 * NOTE: All amounts are stored in CENTS in the database.
 * Stripe also expects amounts in cents, so no conversion is needed.
 */

import { bookingService } from "@/features/bookings/booking.service";
import { paymentService } from "@/features/payments/payment.service";
import { getBaseUrl } from "@/shared/lib/utils/base-url";
import { getStripe } from "@/shared/lib/services/stripe.service";

/**
 * Create a Stripe payment link for a booking request
 * This is used when admin approves a booking request
 */
export async function createPaymentLinkForBooking(bookingId: string): Promise<string> {
  // Get booking with pricing data
  const booking = await bookingService.getBookingWithRelations(bookingId);
  
  if (!booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  // Get amount in cents from pricing table
  const amountCents = booking.pricing?.totalAmountCents;
  
  if (!amountCents || amountCents <= 0) {
    throw new Error(`Invalid booking amount: ${amountCents}`);
  }

  const currency = booking.pricing?.currency?.toLowerCase() ?? 'usd';
  const baseUrl = getBaseUrl();
  const stripe = getStripe();

  // Format date for display
  const bookingDate = booking.startDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create Stripe payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Charter: ${booking.boat?.name || 'Boat Rental'}`,
            description: `Booking date: ${bookingDate}`,
          },
          unit_amount: amountCents, // Already in cents!
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: bookingId,
      bookingType: booking.bookingType,
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${baseUrl}/bookings/payment-success/${bookingId}`,
      },
    },
  });

  // Create a pending payment record in the payments table (includes stripePaymentLinkId)
  await paymentService.createPayment({
    payableType: 'BOOKING',
    payableId: bookingId,
    paymentType: 'FULL_PAYMENT',
    amountCents,
    currency: currency.toUpperCase(),
    status: 'PENDING',
    paymentMethodType: 'STRIPE_LINK',
    stripePaymentLinkId: paymentLink.id,
  });

  return paymentLink.url;
}

/**
 * Get payment link status from Stripe
 */
export async function getPaymentLinkStatus(
  paymentLinkId: string
): Promise<{
  active: boolean;
}> {
  try {
    const stripe = getStripe();
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

/**
 * Retrieve a payment link URL by ID
 */
export async function getPaymentLinkUrl(paymentLinkId: string): Promise<string> {
  const stripe = getStripe();
  const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
  if (!paymentLink?.url) {
    throw new Error("Payment link URL not found");
  }
  return paymentLink.url;
}

/**
 * Mark a payment as succeeded (called from webhook)
 */
export async function markPaymentLinkSucceeded(
  stripePaymentLinkId: string,
  stripePaymentIntentId: string
): Promise<void> {
  // Find the payment by payment link ID
  const payment = await paymentService.getPaymentByStripePaymentLinkId(stripePaymentLinkId);
  
  if (payment) {
    await paymentService.markPaymentSucceeded(payment.id, stripePaymentIntentId);
  }
}
