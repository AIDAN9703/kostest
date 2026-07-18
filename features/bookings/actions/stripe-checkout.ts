/**
 * Stripe Checkout Session Creation
 *
 * Creates Checkout Sessions for all non-instant booking payments:
 * - Admin request bookings (admin creates booking, sends payment link to customer)
 * - Draft pay-now bookings (customer accepts draft and pays immediately)
 *
 * NOTE: All amounts are stored in CENTS in the database.
 * Stripe also expects amounts in cents, so no conversion is needed.
 */

import { bookingService } from "@/features/bookings/services/booking.service";
import { paymentService } from "@/features/payments/payment.service";
import { getBaseUrl } from "@/shared/lib/utils/base-url";
import { getStripe, getOrCreateStripeCustomer } from "@/shared/lib/services/stripe.service";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import type { PaymentType } from "@/database/types";

function toAbsoluteImageUrl(url: string | null, baseUrl: string): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = baseUrl.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * Create a Stripe Checkout Session for a booking.
 * Respects the booking's paymentType — if DEPOSIT_ONLY and a deposit amount
 * is configured, the session charges the deposit; otherwise the full amount.
 * Pass chargeType to override: "deposit" charges deposit only, "full" charges full amount.
 *
 * For full payment: line items show charter base, add-ons, cleaning fee, and card processing fee.
 */
export async function createCheckoutSessionForBooking(
  bookingId: string,
  options?: { chargeType?: "deposit" | "full" }
): Promise<string> {
  const booking = await bookingService.getBookingWithRelations(bookingId);
  if (!booking) throw new Error(`Booking not found: ${bookingId}`);

  const totalCents = booking.pricing?.totalAmountCents;
  if (!totalCents || totalCents <= 0) {
    throw new Error(`Invalid booking amount: ${totalCents}`);
  }

  const hasDeposit = !!(
    booking.pricing?.depositAmountCents &&
    Number(booking.pricing.depositAmountCents) > 0
  );

  let isDeposit: boolean;
  if (options?.chargeType === "deposit") {
    isDeposit = hasDeposit;
  } else if (options?.chargeType === "full") {
    isDeposit = false;
  } else {
    isDeposit = booking.paymentType === "DEPOSIT_ONLY" && hasDeposit;
  }

  const chargeCents = isDeposit ? Number(booking.pricing!.depositAmountCents!) : totalCents;

  const paymentRecordType: PaymentType = isDeposit ? "DEPOSIT" : "FULL_PAYMENT";

  const currency = booking.pricing?.currency?.toLowerCase() ?? "usd";
  const baseUrl = getBaseUrl();
  const stripe = getStripe();

  // Checkout is only reachable for priced proposals/requests — an undated
  // INQUIRY row can never be charged.
  if (!booking.startDateTime) {
    throw new Error("This deal has no trip date yet — price and schedule it before charging.");
  }
  const bookingDate = booking.startDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const boatName = booking.boat?.name || "Boat Rental";
  const boatImageUrl = toAbsoluteImageUrl(booking.boat?.mainImage ?? null, baseUrl);
  const passengerCount = booking.numberOfPassengers ?? 1;
  const descriptionParts = [
    `Date: ${bookingDate}`,
    `${passengerCount} passenger${passengerCount !== 1 ? "s" : ""}`,
  ];
  if (booking.pickupLocation) {
    descriptionParts.push(`Pickup: ${booking.pickupLocation}`);
  }
  const description = descriptionParts.join(" • ");

  // Pre-fill the customer email so Stripe doesn't ask for it
  const customerId = await getOrCreateStripeCustomer(
    booking.customerEmail,
    booking.customerName,
    booking.userId ?? undefined
  );

  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        description?: string;
        images?: string[];
      };
      unit_amount: number;
    };
    quantity: number;
  }> = [];

  if (isDeposit) {
    lineItems.push({
      price_data: {
        currency,
        product_data: {
          name: `Deposit — ${boatName}`,
          description,
          images: boatImageUrl ? [boatImageUrl] : undefined,
        },
        unit_amount: chargeCents,
      },
      quantity: 1,
    });
  } else {
    const basePriceCents = Number(booking.pricing?.basePriceCents ?? 0);
    const cleaningFeeCents = Number(booking.pricing?.cleaningFeeCents ?? 0);
    const serviceFeeCents = Number(booking.pricing?.serviceFeeCents ?? 0);
    const addOns = (booking.addOns ?? []) as Array<{
      name: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;

    if (basePriceCents > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `Charter: ${boatName}`,
            description,
            images: boatImageUrl ? [boatImageUrl] : undefined,
          },
          unit_amount: basePriceCents,
        },
        quantity: 1,
      });
    }
    if (cleaningFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: "Cleaning fee",
            description: `${boatName}`,
          },
          unit_amount: cleaningFeeCents,
        },
        quantity: 1,
      });
    }
    for (const addOn of addOns) {
      const addOnCents = dollarsToCents(addOn.total);
      if (addOnCents > 0) {
        lineItems.push({
          price_data: {
            currency,
            product_data: {
              name: addOn.quantity > 1 ? `${addOn.name} × ${addOn.quantity}` : addOn.name,
              description: boatName,
            },
            unit_amount: addOnCents,
          },
          quantity: 1,
        });
      }
    }
    if (serviceFeeCents > 0) {
      // Percent is derived from the booking's own pricing snapshot so the label
      // always matches what was actually charged, even if settings changed since.
      const feeBaseCents =
        basePriceCents + cleaningFeeCents + addOns.reduce((sum, a) => sum + dollarsToCents(a.total), 0);
      const feePercentLabel =
        feeBaseCents > 0
          ? ` (${String(Number(((serviceFeeCents / feeBaseCents) * 100).toFixed(2)))}%)`
          : "";
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `Card processing fee${feePercentLabel}`,
            description: "Applied to subtotal",
          },
          unit_amount: serviceFeeCents,
        },
        quantity: 1,
      });
    }
    if (lineItems.length === 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: {
            name: `Charter: ${boatName}`,
            description,
            images: boatImageUrl ? [boatImageUrl] : undefined,
          },
          unit_amount: chargeCents,
        },
        quantity: 1,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: lineItems,
    metadata: {
      bookingId,
      bookingType: booking.bookingType,
      paymentRecordType,
    },
    success_url: `${baseUrl}/bookings/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/bookings/payment-success?session_id={CHECKOUT_SESSION_ID}&cancelled=true`,
  });

  // Create a PENDING payment record linked to this checkout session
  await paymentService.createPayment({
    payableType: "BOOKING",
    payableId: bookingId,
    paymentType: paymentRecordType,
    amountCents: chargeCents,
    currency: currency.toUpperCase(),
    status: "PENDING",
    paymentMethodType: "STRIPE_CHECKOUT",
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: customerId,
  });

  return session.url!;
}

/**
 * Get an existing valid checkout session URL for a booking,
 * or create a new one if none exists / the old one expired.
 */
export async function getOrCreateCheckoutUrl(bookingId: string): Promise<string> {
  const existingPayments = await paymentService.getPaymentsForPayable("BOOKING", bookingId);

  // Check for an existing PENDING checkout session
  const pendingCheckout = existingPayments.find(
    (p) =>
      p.paymentMethodType === "STRIPE_CHECKOUT" &&
      p.status === "PENDING" &&
      p.stripeCheckoutSessionId
  );

  if (pendingCheckout?.stripeCheckoutSessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(
        pendingCheckout.stripeCheckoutSessionId
      );
      // Session is still open — return its URL
      if (session.status === "open" && session.url) {
        return session.url;
      }
    } catch {
      // Session expired or invalid — fall through to create a new one
    }

    // Mark the stale payment as CANCELLED
    await paymentService.updatePayment(pendingCheckout.id, {
      status: "CANCELLED",
    });
  }

  // Also check for legacy Payment Link payments
  const pendingLink = existingPayments.find(
    (p) => p.paymentMethodType === "STRIPE_LINK" && p.status === "PENDING" && p.stripePaymentLinkId
  );

  if (pendingLink?.stripePaymentLinkId) {
    try {
      const stripe = getStripe();
      const paymentLink = await stripe.paymentLinks.retrieve(pendingLink.stripePaymentLinkId);
      if (paymentLink.active && paymentLink.url) {
        return paymentLink.url;
      }
    } catch {
      // Payment link invalid — fall through
    }
  }

  return createCheckoutSessionForBooking(bookingId);
}
