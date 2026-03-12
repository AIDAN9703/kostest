/**
 * Booking Invoice Service
 * Creates Stripe invoices for draft bookings
 */

import { db } from "@/database/db";
import { bookings, bookingPricing, boats } from "@/database/schema";
import { eq, inArray } from "drizzle-orm";
import { paymentService } from "@/features/payments/payment.service";
import { getStripe, getOrCreateStripeCustomer } from "@/shared/lib/services/stripe.service";
import type { Booking } from "@/database/types";

export interface CreateDraftBookingInvoiceResult {
  invoiceId: string;
  hostedInvoiceUrl: string | null;
}

/**
 * Create Stripe invoice for draft booking(s) - used when customer accepts and pays
 */
export async function createDraftBookingInvoice(
  firstDraftBooking: Booking,
  firstBookingId: string
): Promise<CreateDraftBookingInvoiceResult> {
  const stripe = getStripe();

  const existingPayments = await paymentService.getPaymentsForPayable(
    "BOOKING",
    firstBookingId
  );
  const pendingInvoice = existingPayments.find(
    (p) => p.paymentMethodType === "STRIPE_INVOICE" && p.status === "PENDING"
  );
  if (pendingInvoice?.stripeInvoiceId) {
    const inv = await stripe.invoices.retrieve(pendingInvoice.stripeInvoiceId);
    if (inv.status !== "paid") {
      return {
        invoiceId: inv.id!,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      };
    }
  }

  const draftBookings = firstDraftBooking.bookingGroupId
    ? await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingGroupId, firstDraftBooking.bookingGroupId))
    : [firstDraftBooking];

  const bookingIds = draftBookings.map((b) => b.id);
  const pricingRows = await db
    .select()
    .from(bookingPricing)
    .where(inArray(bookingPricing.bookingId, bookingIds));

  const boatIds = [...new Set(draftBookings.map((b) => b.boatId))];
  const boatRows = await db
    .select({ id: boats.id, name: boats.name })
    .from(boats)
    .where(inArray(boats.id, boatIds));
  const boatsById = new Map(boatRows.map((b) => [b.id, b]));

  const pricingByBooking = new Map(pricingRows.map((p) => [p.bookingId, p]));

  const customerId = await getOrCreateStripeCustomer(
    firstDraftBooking.customerEmail,
    firstDraftBooking.customerName,
    firstDraftBooking.userId ?? undefined
  );

  const currency = "usd";
  const dateStr = new Date(firstDraftBooking.startDateTime).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );

  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: 30,
    auto_advance: false,
    metadata: { firstBookingId },
    custom_fields: [
      { name: "Trip Date", value: dateStr },
      { name: "Passengers", value: String(firstDraftBooking.numberOfPassengers) },
    ],
  });

  let totalCents = 0;
  for (const b of draftBookings) {
    const pricing = pricingByBooking.get(b.id);
    const boat = boatsById.get(b.boatId);
    const boatName = boat?.name ?? "Charter";
    const amountCents = pricing ? Number(pricing.totalAmountCents) : 0;
    totalCents += amountCents;

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amountCents,
      currency,
      description: `${boatName} — Charter`,
    });
  }

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id!);
  const sent = await stripe.invoices.sendInvoice(finalized.id!);

  const paymentType =
    firstDraftBooking.paymentType === "DEPOSIT_ONLY" ? "DEPOSIT" : "FULL_PAYMENT";

  await paymentService.createPayment({
    payableType: "BOOKING",
    payableId: firstBookingId,
    paymentType: paymentType as "DEPOSIT" | "FULL_PAYMENT",
    amountCents: totalCents,
    currency: "USD",
    status: "PENDING",
    paymentMethodType: "STRIPE_INVOICE",
    stripeInvoiceId: sent.id!,
    stripeCustomerId: customerId,
  });

  return {
    invoiceId: sent.id!,
    hostedInvoiceUrl: sent.hosted_invoice_url ?? null,
  };
}
