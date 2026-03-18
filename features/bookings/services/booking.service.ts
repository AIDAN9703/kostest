/**
 * Booking Service Layer
 * Single source of truth for all booking database operations
 *
 * ARCHITECTURE:
 * - Uses transactions for multi-table operations
 * - Delegates to specialized services (pricing, status, notes, payments)
 * - All monetary values are in CENTS
 *
 * RELATED SERVICES:
 * - BookingPricingService - manages booking_pricing table
 * - BookingStatusService - manages status transitions and history
 * - BookingNotesService - manages admin notes
 * - PaymentService - manages payments (in features/payments)
 */

import { db } from "@/database/db";
import {
  bookings,
  boats,
  users,
  boatPricingTiers,
  bookingPricing,
  bookingStatusHistory,
  bookingEvents,
  bookingAdminNotes,
  bookingGroups,
  payments,
  bookingOps,
} from "@/database/schema";
import { and, count, eq, desc, or, ilike, sql, gte, lte, aliasedTable, inArray } from "drizzle-orm";

import {
  type BookingFilterInput,
  type BookingUpdateInput,
  type CreateBookingsInput,
} from "@/features/bookings/booking.validation";
import {
  type PaginatedBookingsResponse,
  type BookingListItem,
  type BookingDetails,
  type BookingWithRelations,
} from "@/features/bookings/booking.types";
import {
  type Booking,
  type BookingStatus,
  type PaymentStatus,
  type BookingSource,
} from "@/database/types";
import {
  calculateBookingPriceFromDollars,
  calculateBookingPriceCents,
} from "@/shared/lib/utils/pricing-utils";
import { dollarsToCents, type Cents } from "@/shared/lib/utils/money-utils";
import { toDateOrNull, calculateEndDateTime } from "@/shared/lib/utils/date-helpers";
import { computePaymentDisplayStatus } from "@/shared/lib/utils/payment-display";
import { bookingGroupService } from "@/features/booking-groups/booking-group.service";
import { bookingPricingService } from "@/features/bookings/services/booking-pricing.service";
import { bookingStatusService } from "@/features/bookings/services/booking-status.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { fetchBoatAndTier, fetchBoatsAndTiersBulk } from "@/features/bookings/booking-helpers";

/** Serializable snapshot for booking.updated audit events */
function bookingAuditSnapshot(b: BookingDetails): Record<string, unknown> {
  return {
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    numberOfPassengers: b.numberOfPassengers,
    needsCaptain: b.needsCaptain,
    pickupLocation: b.pickupLocation,
    dropoffLocation: b.dropoffLocation,
    startDateTime:
      b.startDateTime instanceof Date ? b.startDateTime.toISOString() : String(b.startDateTime),
    endDateTime:
      b.endDateTime instanceof Date
        ? b.endDateTime.toISOString()
        : b.endDateTime
          ? String(b.endDateTime)
          : null,
    boatId: b.boatId,
    pricingTierId: b.pricingTierId,
    basePriceCents: b.basePriceCents ?? null,
    captainFeeCents: b.captainFeeCents ?? null,
    cleaningFeeCents: b.cleaningFeeCents ?? null,
    serviceFeeCents: b.serviceFeeCents ?? null,
    totalAmountCents: b.totalAmountCents ?? null,
    depositAmountCents: b.depositAmountCents ?? null,
  };
}

// ============================================================================
// BOOKING SERVICE CLASS
// ============================================================================

export class BookingService {
  // ==========================================================================
  // CREATE OPERATIONS
  // ==========================================================================

  /**
   * Create multiple bookings in a group - unified flow with per-booking customer/dates
   */
  async createBookings(
    input: CreateBookingsInput,
    assignedAdminId?: string | null
  ): Promise<{ bookingIds: string[]; publicToken: string | null; groupId: string | null }> {
    const now = new Date();
    const boatIds = [...new Set(input.bookings.map((b) => b.boatId))];
    const tierIds = input.bookings.map((b) => b.pricingTierId).filter((id): id is string => !!id);
    const { boatsById, tiersById } = await fetchBoatsAndTiersBulk(boatIds, tierIds);

    let groupId: string | null = null;
    if (input.bookings.length > 1 || input.groupName) {
      const group = await bookingGroupService.create({
        name: input.groupName ?? `Booking Group ${now.toLocaleDateString()}`,
        notes: null,
        createdById: assignedAdminId ?? null,
      });
      groupId = group.id;
    }

    const publicToken = crypto.randomUUID();
    const bookingIds: string[] = [];
    const lineItemsTotal = (input.lineItems ?? []).reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    for (let i = 0; i < input.bookings.length; i++) {
      const b = input.bookings[i];
      const boat = boatsById.get(b.boatId);
      const tier = b.pricingTierId ? tiersById.get(b.pricingTierId) : null;

      if (!boat) throw new Error(`Boat not found: ${b.boatId}`);
      if (b.pricingTierId && !tier) throw new Error(`Pricing tier not found: ${b.pricingTierId}`);

      const basePrice = tier ? (b.basePrice ?? tier.price) : b.basePrice;
      if (basePrice == null || basePrice < 0)
        throw new Error("Base price is required and must be positive");

      const startDateTime = new Date(b.startDateTime);
      const endDateTime = b.endDateTime
        ? new Date(b.endDateTime)
        : tier
          ? calculateEndDateTime(startDateTime, tier.hours)
          : null;
      if (!endDateTime) throw new Error("End date & time is required for custom pricing");

      const addOnsForThisBooking = i === 0 ? (input.lineItems ?? []) : [];
      const addOnsTotalDollars = addOnsForThisBooking.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const addOnsCents = dollarsToCents(addOnsTotalDollars);
      const basePriceCents = dollarsToCents(basePrice);

      const priceBreakdown = calculateBookingPriceCents(
        basePriceCents,
        dollarsToCents(boat.cleaningFee ?? 0),
        0,
        addOnsCents
      );
      const depositDollars =
        b.depositAmount != null && b.depositAmount >= 0
          ? b.depositAmount
          : (boat.depositAmount ?? 0);
      const depositCents = dollarsToCents(depositDollars);

      const addOnsPayload = addOnsForThisBooking.map((item) => ({
        name: item.name,
        description: item.description ?? null,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      }));

      const tokenForThisBooking = i === 0 ? publicToken : null;
      const publishNow = input.publishNow ?? false;

      const [booking] = await db
        .insert(bookings)
        .values({
          bookingType: "EXTERNAL_BOOKING",
          bookingStatus: "DRAFT",
          source: "ADMIN" as BookingSource,
          userId: b.userId ?? null,
          boatOwnerId: boat.ownerId,
          boatId: boat.id,
          pricingTierId: tier?.id ?? null,
          bookingGroupId: groupId,
          customerName: b.customerName,
          customerEmail: b.customerEmail,
          customerPhone: b.customerPhone ?? "",
          isMultiDay: false,
          needsCaptain: boat.crewRequired,
          startDateTime,
          endDateTime,
          numberOfPassengers: input.numberOfPassengers,
          pickupLocation: input.pickupLocation ?? null,
          dropoffLocation: input.dropoffLocation ?? null,
          adminNotes: input.adminNotes ?? null,
          addOns: addOnsPayload.length > 0 ? addOnsPayload : null,
          inquiryId: null,
          assignedAdminId: assignedAdminId ?? null,
          publicToken: tokenForThisBooking,
          allowPayment: input.allowPayment ?? false,
          paymentType: input.paymentType ?? "FULL_PAYMENT",
          publishedAt: publishNow ? now : null,
        })
        .returning({ id: bookings.id });

      await bookingPricingService.createPricingWithCalculation(booking.id, {
        basePriceCents,
        addOnsCents,
        cleaningFeeCents: dollarsToCents(boat.cleaningFee ?? 0),
        depositAmountCents: depositCents || undefined,
        currency: "USD",
      });

      await bookingStatusService.createInitialHistory(
        booking.id,
        "DRAFT",
        assignedAdminId,
        "Booking created"
      );

      bookingIds.push(booking.id);
    }

    if (publicToken && bookingIds.length > 0) {
      await bookingEventsService.logDraftPublished({
        bookingId: bookingIds[0],
        actorId: assignedAdminId ?? null,
        publicToken,
        groupId,
        allBookingIds: bookingIds,
      });
    }

    return {
      bookingIds,
      publicToken,
      groupId,
    };
  }

  /**
   * Get draft bookings with boat and pricing for public display
   */
  async getDraftBookingsForPublicDisplay(token: string) {
    const draftBookings = await this.getDraftBookingsByPublicToken(token);
    if (!draftBookings || draftBookings.length === 0) return null;

    const boatIds = [...new Set(draftBookings.map((b) => b.boatId))];
    const [boatsRows, pricingRows] = await Promise.all([
      db
        .select({ id: boats.id, name: boats.name, mainImage: boats.mainImage })
        .from(boats)
        .where(inArray(boats.id, boatIds)),
      db
        .select()
        .from(bookingPricing)
        .where(
          inArray(
            bookingPricing.bookingId,
            draftBookings.map((b) => b.id)
          )
        ),
    ]);
    const boatsById = new Map(boatsRows.map((b) => [b.id, b]));
    const pricingByBooking = new Map(pricingRows.map((p) => [p.bookingId, p]));

    const first = draftBookings[0];
    const firstPricing = pricingByBooking.get(first.id);
    const totalCents = draftBookings.reduce(
      (sum, b) => sum + Number(pricingByBooking.get(b.id)?.totalAmountCents ?? 0),
      0
    );
    return {
      id: first.id,
      customerName: first.customerName,
      customerEmail: first.customerEmail,
      startDateTime: first.startDateTime,
      endDateTime: first.endDateTime,
      numberOfPassengers: first.numberOfPassengers,
      pickupLocation: first.pickupLocation,
      dropoffLocation: first.dropoffLocation,
      allowPayment: first.allowPayment,
      paymentType: first.paymentType,
      acceptedAt: first.acceptedAt,
      depositAmountCents: firstPricing?.depositAmountCents
        ? Number(firstPricing.depositAmountCents)
        : null,
      totalAmountCents: totalCents,
      bookings: draftBookings.map((b) => {
        const boat = boatsById.get(b.boatId);
        const pricing = pricingByBooking.get(b.id);
        const addOns = (b.addOns ?? null) as Array<{
          name: string;
          description?: string | null;
          unitPrice: number;
          quantity: number;
          total: number;
        }> | null;
        const basePriceCents = pricing ? Number(pricing.basePriceCents) : 0;
        const cleaningFeeCents = pricing ? Number(pricing.cleaningFeeCents ?? 0) : 0;
        const serviceFeeCents = pricing ? Number(pricing.serviceFeeCents ?? 0) : 0;
        const totalCents = pricing ? Number(pricing.totalAmountCents) : 0;
        return {
          id: b.id,
          boatId: b.boatId,
          boatName: boat?.name ?? "Charter",
          boatMainImage: boat?.mainImage ?? null,
          basePriceCents,
          cleaningFeeCents,
          serviceFeeCents,
          totalCents,
          addOns: addOns ?? null,
        };
      }),
    };
  }

  /**
   * Get draft bookings by public token (for customer view/accept page)
   * Returns all draft bookings - single or group (via first booking's group)
   */
  async getDraftBookingsByPublicToken(token: string) {
    const [first] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.publicToken, token))
      .limit(1);

    if (!first) return null;
    if (first.bookingStatus !== "DRAFT" && first.bookingStatus !== "APPROVED") return null;

    if (first.bookingGroupId) {
      const groupBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingGroupId, first.bookingGroupId))
        .orderBy(bookings.startDateTime);
      return groupBookings;
    }

    return [first];
  }

  /**
   * Accept draft booking(s) - customer confirms, status moves to APPROVED
   */
  async acceptDraftBookings(input: {
    publicToken: string;
    customerNote?: string | null;
    payNow?: boolean;
    chargeType?: "deposit" | "full";
  }): Promise<{ bookingIds: string[]; checkoutUrl?: string | null }> {
    const draftBookings = await this.getDraftBookingsByPublicToken(input.publicToken);
    if (!draftBookings || draftBookings.length === 0) {
      throw new Error("Draft booking not found or already accepted");
    }

    const now = new Date();
    const bookingIds: string[] = [];

    for (const b of draftBookings) {
      await bookingStatusService.acceptDraft(b.id, {
        acceptedAt: now,
        acceptedCustomerNote: input.customerNote ?? null,
      });
      bookingIds.push(b.id);
    }

    let checkoutUrl: string | null = null;
    if (input.payNow && draftBookings[0].allowPayment && bookingIds.length > 0) {
      try {
        const { createCheckoutSessionForBooking } = await import(
          "@/features/bookings/actions/stripe-checkout"
        );
        checkoutUrl = await createCheckoutSessionForBooking(bookingIds[0], {
          chargeType: input.chargeType,
        });
      } catch (err) {
        console.error("Failed to create checkout session for draft:", err);
      }
    }

    return { bookingIds, checkoutUrl };
  }

  /**
   * Create a customer booking request
   */
  async createBookingRequest(input: {
    boatId: string;
    pricingTierId: string;
    userId?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    startDateTime: Date;
    endDateTime: Date | null;
    numberOfPassengers: number;
    needsCaptain: boolean;
  }): Promise<Booking> {
    const { boat, tier } = await fetchBoatAndTier(input.boatId, input.pricingTierId);
    if (!tier) throw new Error(`Pricing tier not found: ${input.pricingTierId}`);

    const resolvedEndDateTime =
      input.endDateTime ?? calculateEndDateTime(input.startDateTime, tier.hours);
    const priceBreakdown = calculateBookingPriceFromDollars(tier.price, boat.cleaningFee ?? 0, 0);
    const depositAmountCents = dollarsToCents(boat.depositAmount ?? 0);

    const now = new Date();

    const [newBooking] = await db
      .insert(bookings)
      .values({
        bookingType: "REQUEST",
        bookingStatus: "PENDING",
        source: "WEBSITE" as BookingSource,
        userId: input.userId ?? null,
        boatOwnerId: boat.ownerId,
        boatId: input.boatId,
        pricingTierId: input.pricingTierId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        isMultiDay: false,
        needsCaptain: input.needsCaptain,
        startDateTime: input.startDateTime,
        endDateTime: resolvedEndDateTime,
        numberOfPassengers: input.numberOfPassengers,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await bookingPricingService.createPricing({
      bookingId: newBooking.id,
      basePriceCents: priceBreakdown.basePriceCents,
      captainFeeCents: priceBreakdown.captainFeeCents || null,
      cleaningFeeCents: priceBreakdown.cleaningFeeCents || null,
      serviceFeeCents: priceBreakdown.serviceFeeCents,
      depositAmountCents: depositAmountCents || null,
      totalAmountCents: priceBreakdown.totalPriceCents,
      currency: "USD",
    });

    await bookingStatusService.createInitialHistory(
      newBooking.id,
      "PENDING",
      input.userId,
      "Booking request submitted"
    );

    return newBooking;
  }

  /**
   * Create an instant booking (payment at checkout)
   */
  async createInstantBooking(input: {
    boatId: string;
    pricingTierId: string | null;
    userId?: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    startDateTime: Date;
    endDateTime: Date | null;
    numberOfPassengers: number;
    needsCaptain: boolean;
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    stripeCheckoutSessionId?: string;
    /** When provided (e.g. from webhook metadata), use these instead of calculating from boat+tier */
    pricingOverrideCents?: {
      basePriceCents: number;
      cleaningFeeCents: number;
      captainFeeCents: number;
      serviceFeeCents: number;
      totalPriceCents: number;
      depositAmountCents?: number;
    };
  }): Promise<Booking> {
    const { boat, tier } = await fetchBoatAndTier(input.boatId, input.pricingTierId);

    let priceBreakdown: {
      basePriceCents: number;
      captainFeeCents: number;
      cleaningFeeCents: number;
      serviceFeeCents: number;
      totalPriceCents: number;
    };
    let depositAmountCents: number;
    let resolvedEndDateTime: Date | null;

    if (input.pricingOverrideCents) {
      priceBreakdown = input.pricingOverrideCents;
      depositAmountCents = input.pricingOverrideCents.depositAmountCents ?? 0;
      resolvedEndDateTime = input.endDateTime;
    } else {
      if (!tier) throw new Error("pricingTierId or pricingOverrideCents required");
      resolvedEndDateTime =
        input.endDateTime ?? calculateEndDateTime(input.startDateTime, tier.hours);
      const calc = calculateBookingPriceFromDollars(tier.price, boat.cleaningFee ?? 0, 0);
      priceBreakdown = calc;
      depositAmountCents = dollarsToCents(boat.depositAmount ?? 0);
    }

    const now = new Date();

    const [newBooking] = await db
      .insert(bookings)
      .values({
        bookingType: "INSTANT_BOOK",
        bookingStatus: "CONFIRMED",
        source: "WEBSITE" as BookingSource,
        userId: input.userId ?? null,
        boatOwnerId: boat.ownerId,
        boatId: input.boatId,
        pricingTierId: input.pricingTierId ?? null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        isMultiDay: false,
        needsCaptain: input.needsCaptain,
        startDateTime: input.startDateTime,
        endDateTime: resolvedEndDateTime,
        numberOfPassengers: input.numberOfPassengers,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Create pricing record via pricing service
    await bookingPricingService.createPricing({
      bookingId: newBooking.id,
      basePriceCents: priceBreakdown.basePriceCents,
      captainFeeCents: priceBreakdown.captainFeeCents || null,
      cleaningFeeCents: priceBreakdown.cleaningFeeCents || null,
      serviceFeeCents: priceBreakdown.serviceFeeCents,
      depositAmountCents: depositAmountCents || null,
      totalAmountCents: priceBreakdown.totalPriceCents,
      currency: "USD",
    });

    // Create status history
    await bookingStatusService.createInitialHistory(
      newBooking.id,
      "CONFIRMED",
      input.userId,
      "Instant booking - payment received"
    );

    // Create payment record
    await db.insert(payments).values({
      payableType: "BOOKING",
      payableId: newBooking.id,
      paymentType: "FULL_PAYMENT",
      amountCents: priceBreakdown.totalPriceCents,
      currency: "USD",
      status: "SUCCEEDED",
      paymentMethodType: "STRIPE_CHECKOUT",
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
      stripeCustomerId: input.stripeCustomerId ?? null,
      processedAt: now,
    });

    return newBooking;
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Get paginated and filtered bookings
   * Returns cents-based pricing from booking_pricing table
   */
  async getAllBookings(filters?: BookingFilterInput): Promise<PaginatedBookingsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(bookings.customerName || "", `%${filters.search}%`),
          ilike(bookings.customerEmail || "", `%${filters.search}%`),
          ilike(bookings.customerPhone || "", `%${filters.search}%`),
          ilike(boats.name || "", `%${filters.search}%`)
        )
      );
    }

    if (filters?.bookingStatus) {
      whereConditions.push(eq(bookings.bookingStatus, filters.bookingStatus));
    }
    if (filters?.paymentStatus) {
      const ps = filters.paymentStatus;
      if (ps === "UNPAID") {
        whereConditions.push(
          sql`NOT EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
          )`
        );
      } else if (ps === "PAID") {
        whereConditions.push(
          sql`COALESCE((
            SELECT SUM(p.amount_cents) FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
          ), 0) >= ${bookingPricing.totalAmountCents}`
        );
      } else if (ps === "DEPOSIT_PAID") {
        whereConditions.push(
          sql`COALESCE((
            SELECT SUM(p.amount_cents) FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
          ), 0) > 0`,
          sql`COALESCE((
            SELECT SUM(p.amount_cents) FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
          ), 0) < ${bookingPricing.totalAmountCents}`
        );
      } else if (ps === "REFUNDED") {
        whereConditions.push(
          sql`EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND (p.status = 'REFUNDED' OR p.payment_type = 'REFUND')
          )`
        );
      } else if (ps === "FAILED") {
        whereConditions.push(
          sql`EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'FAILED'
          )`,
          sql`NOT EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'SUCCEEDED'
          )`
        );
      } else if (ps === "PROCESSING") {
        whereConditions.push(
          sql`EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'PROCESSING'
          )`
        );
      } else if (ps === "CHARGEBACK") {
        whereConditions.push(
          sql`EXISTS (
            SELECT 1 FROM payment p
            WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
              AND p.status = 'CHARGEBACK'
          )`
        );
      }
    }
    if (filters?.bookingType) {
      whereConditions.push(eq(bookings.bookingType, filters.bookingType));
    }
    if (filters?.dateFrom) {
      whereConditions.push(gte(bookings.startDateTime, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      whereConditions.push(lte(bookings.startDateTime, new Date(filters.dateTo)));
    }
    if (filters?.boatId) {
      whereConditions.push(eq(bookings.boatId, filters.boatId));
    }
    if (filters?.bookingGroupId) {
      whereConditions.push(eq(bookings.bookingGroupId, filters.bookingGroupId));
    }
    if (filters?.customerId) {
      whereConditions.push(eq(bookings.userId, filters.customerId));
    }
    if (filters?.assignedAdminId) {
      whereConditions.push(eq(bookings.assignedAdminId, filters.assignedAdminId));
    }
    if (filters?.needsCaptain !== undefined) {
      whereConditions.push(eq(bookings.needsCaptain, filters.needsCaptain));
    }
    // Filter by amount (in cents now)
    if (filters?.minAmount) {
      const minCents = filters.minAmount * 100; // Convert dollars to cents for filter
      whereConditions.push(sql`${bookingPricing.totalAmountCents} >= ${minCents}`);
    }
    if (filters?.maxAmount) {
      const maxCents = filters.maxAmount * 100; // Convert dollars to cents for filter
      whereConditions.push(sql`${bookingPricing.totalAmountCents} <= ${maxCents}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const assignedAdmin = aliasedTable(users, "assignedAdmin");

    const selectFields = {
      id: bookings.id,
      bookingType: bookings.bookingType,
      bookingStatus: bookings.bookingStatus,
      paymentStatus: sql<string>`(
        SELECT p.status FROM payment p 
        WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
        ORDER BY p.created_at DESC LIMIT 1
      )`.as("paymentStatus"),
      totalPaidCents: sql<number>`COALESCE((
        SELECT SUM(p.amount_cents) FROM payment p
        WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
          AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
      ), 0)`.as("totalPaidCents"),
      hasRefund: sql<boolean>`EXISTS (
        SELECT 1 FROM payment p
        WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
          AND (p.status = 'REFUNDED' OR p.payment_type = 'REFUND')
      )`.as("hasRefund"),
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      // Pricing from booking_pricing table (in cents)
      totalAmountCents: bookingPricing.totalAmountCents,
      currency: bookingPricing.currency,
      // stripePaymentLinkId removed - stored in payments table
      needsCaptain: bookings.needsCaptain,
      createdAt: bookings.createdAt,
      boatId: bookings.boatId,
      bookingGroupId: bookings.bookingGroupId,
      bookingGroupName: bookingGroups.name,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      userId: bookings.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      userProfileImage: users.profileImage,
      assignedAdminId: bookings.assignedAdminId,
      assignedAdminFirstName: assignedAdmin.firstName,
      assignedAdminLastName: assignedAdmin.lastName,
      assignedAdminEmail: assignedAdmin.email,
      // Ops fields (from booking_ops - Excel workflow tracking)
      opsExpenseCents: bookingOps.expenseCents,
      opsRevenueCents: bookingOps.revenueCents,
      opsBalanceOwnerCents: bookingOps.balanceOwnerCents,
      opsCrewName: bookingOps.crewName,
      opsContractSigned: bookingOps.contractSigned,
      opsCaptainPaid: bookingOps.captainPaid,
      opsCommissionCents: bookingOps.commissionCents,
      opsSourceOverride: bookingOps.sourceOverride,
    };

    const [bookingsData, countResult] = await Promise.all([
      db
        .select(selectFields)
        .from(bookings)
        .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
        .leftJoin(bookingOps, eq(bookings.id, bookingOps.bookingId))
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .leftJoin(bookingGroups, eq(bookings.bookingGroupId, bookingGroups.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(assignedAdmin, eq(bookings.assignedAdminId, assignedAdmin.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(bookings.createdAt)),
      db
        .select({ value: count() })
        .from(bookings)
        .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .where(whereClause),
    ]);

    const mappedBookings: BookingListItem[] = bookingsData.map((b) => {
      const totalAmountCents = b.totalAmountCents ?? 0;
      const totalPaidCents = Number(b.totalPaidCents) || 0;
      const hasRefund = Boolean(b.hasRefund);
      const latestPaymentStatus = b.paymentStatus ?? null;

      return {
        ...b,
        totalAmountCents,
        totalPaidCents,
        hasRefund,
        currency: b.currency ?? "USD",
        paymentStatus: latestPaymentStatus,
        paymentDisplayStatus: computePaymentDisplayStatus({
          totalPaidCents,
          totalAmountCents,
          latestPaymentStatus,
          hasRefund,
        }),
      };
    });

    return {
      bookings: mappedBookings,
      totalCount: countResult[0].value,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].value / limit),
    };
  }

  /**
   * Get single booking by ID with full details
   * Pricing comes from booking_pricing table (in cents)
   */
  async getBookingById(id: string): Promise<BookingDetails | null> {
    const assignedAdmin = aliasedTable(users, "assignedAdmin");
    const boatOwner = aliasedTable(users, "boatOwner");

    const [booking] = await db
      .select({
        id: bookings.id,
        bookingType: bookings.bookingType,
        bookingStatus: bookings.bookingStatus,
        source: bookings.source,
        userId: bookings.userId,
        boatOwnerId: bookings.boatOwnerId,
        boatId: bookings.boatId,
        captainUserId: bookings.captainUserId,
        pricingTierId: bookings.pricingTierId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        isMultiDay: bookings.isMultiDay,
        needsCaptain: bookings.needsCaptain,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        numberOfPassengers: bookings.numberOfPassengers,
        pickupLocation: bookings.pickupLocation,
        dropoffLocation: bookings.dropoffLocation,
        // stripePaymentLinkId removed - stored in payments table
        // Pricing from booking_pricing (in cents)
        basePriceCents: bookingPricing.basePriceCents,
        captainFeeCents: bookingPricing.captainFeeCents,
        cleaningFeeCents: bookingPricing.cleaningFeeCents,
        serviceFeeCents: bookingPricing.serviceFeeCents,
        taxAmountCents: bookingPricing.taxAmountCents,
        discountAmountCents: bookingPricing.discountAmountCents,
        totalAmountCents: bookingPricing.totalAmountCents,
        depositAmountCents: bookingPricing.depositAmountCents,
        currency: bookingPricing.currency,
        paymentStatus: sql<string>`(
          SELECT p.status FROM payment p 
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
          ORDER BY p.created_at DESC LIMIT 1
        )`.as("paymentStatus"),
        paymentMethod: sql<string>`(
          SELECT p.payment_method_type FROM payment p 
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
          ORDER BY p.created_at DESC LIMIT 1
        )`.as("paymentMethod"),
        totalPaidCents: sql<number>`COALESCE((
          SELECT SUM(p.amount_cents) FROM payment p
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
            AND p.status = 'SUCCEEDED' AND p.payment_type != 'REFUND'
        ), 0)`.as("totalPaidCents"),
        hasRefund: sql<boolean>`EXISTS (
          SELECT 1 FROM payment p
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id}
            AND (p.status = 'REFUNDED' OR p.payment_type = 'REFUND')
        )`.as("hasRefund"),
        bookingGroupId: bookings.bookingGroupId,
        bookingGroupName: bookingGroups.name,
        assignedAdminId: bookings.assignedAdminId,
        // contactedAt removed - derive from booking_admin_notes
        cancelledAt: bookings.cancelledAt,
        cancellationReason: bookings.cancellationReason,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        expiresAt: bookings.expiresAt,
        // Boat info
        boatName: boats.name,
        boatCategory: boats.category,
        boatMainImage: boats.mainImage,
        boatCapacity: boats.capacity,
        boatTimezone: boats.timezone,
        // User info
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userProfileImage: users.profileImage,
        // Boat owner info
        boatOwnerFirstName: boatOwner.firstName,
        boatOwnerLastName: boatOwner.lastName,
        boatOwnerEmail: boatOwner.email,
        // Assigned admin info
        assignedAdminFirstName: assignedAdmin.firstName,
        assignedAdminLastName: assignedAdmin.lastName,
        assignedAdminEmail: assignedAdmin.email,
      })
      .from(bookings)
      .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .leftJoin(bookingGroups, eq(bookings.bookingGroupId, bookingGroups.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(boatOwner, eq(bookings.boatOwnerId, boatOwner.id))
      .leftJoin(assignedAdmin, eq(bookings.assignedAdminId, assignedAdmin.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) return null;

    const totalAmountCents = booking.totalAmountCents ?? 0;
    const totalPaidCents = Number(booking.totalPaidCents) || 0;
    const hasRefund = Boolean(booking.hasRefund);
    const latestPaymentStatus = booking.paymentStatus ?? null;

    const details: BookingDetails = {
      ...booking,
      totalAmountCents,
      totalPaidCents,
      hasRefund,
      currency: booking.currency ?? "USD",
      paymentStatus: latestPaymentStatus,
      paymentMethod: booking.paymentMethod ?? null,
      paymentDisplayStatus: computePaymentDisplayStatus({
        totalPaidCents,
        totalAmountCents,
        latestPaymentStatus,
        hasRefund,
      }),
    };
    return details;
  }

  /**
   * Get booking with all related data (pricing, payments, history, notes)
   */
  async getBookingWithRelations(id: string): Promise<BookingWithRelations | null> {
    const assignedAdmin = aliasedTable(users, "assignedAdmin");
    const noteAdmin = aliasedTable(users, "noteAdmin");
    const historyUser = aliasedTable(users, "historyUser");

    // Get core booking with boat and user joins
    const [booking] = await db
      .select({
        id: bookings.id,
        bookingType: bookings.bookingType,
        bookingStatus: bookings.bookingStatus,
        source: bookings.source,
        userId: bookings.userId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        boatId: bookings.boatId,
        pricingTierId: bookings.pricingTierId,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        numberOfPassengers: bookings.numberOfPassengers,
        isMultiDay: bookings.isMultiDay,
        needsCaptain: bookings.needsCaptain,
        pickupLocation: bookings.pickupLocation,
        dropoffLocation: bookings.dropoffLocation,
        assignedAdminId: bookings.assignedAdminId,
        cancelledAt: bookings.cancelledAt,
        cancellationReason: bookings.cancellationReason,
        cancelledBy: bookings.cancelledBy,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        expiresAt: bookings.expiresAt,
        paymentType: bookings.paymentType,
        addOns: bookings.addOns,
        // Boat
        boatName: boats.name,
        boatCategory: boats.category,
        boatMainImage: boats.mainImage,
        boatCapacity: boats.capacity,
        boatTimezone: boats.timezone,
        boatOwnerId: boats.ownerId,
        // User
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userProfileImage: users.profileImage,
        // Assigned admin
        assignedAdminFirstName: assignedAdmin.firstName,
        assignedAdminLastName: assignedAdmin.lastName,
        assignedAdminEmail: assignedAdmin.email,
      })
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(assignedAdmin, eq(bookings.assignedAdminId, assignedAdmin.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) return null;

    // Fetch related data in parallel
    const eventActor = aliasedTable(users, "eventActor");
    const [pricingData, paymentsData, historyData, notesData, eventsData] = await Promise.all([
      db.select().from(bookingPricing).where(eq(bookingPricing.bookingId, id)).limit(1),
      db
        .select()
        .from(payments)
        .where(and(eq(payments.payableType, "BOOKING"), eq(payments.payableId, id)))
        .orderBy(desc(payments.createdAt)),
      db
        .select({
          id: bookingStatusHistory.id,
          fromStatus: bookingStatusHistory.fromStatus,
          toStatus: bookingStatusHistory.toStatus,
          changedByUserId: bookingStatusHistory.changedByUserId,
          reason: bookingStatusHistory.reason,
          createdAt: bookingStatusHistory.createdAt,
          changedByFirstName: historyUser.firstName,
          changedByLastName: historyUser.lastName,
        })
        .from(bookingStatusHistory)
        .leftJoin(historyUser, eq(bookingStatusHistory.changedByUserId, historyUser.id))
        .where(eq(bookingStatusHistory.bookingId, id))
        .orderBy(desc(bookingStatusHistory.createdAt)),
      db
        .select({
          id: bookingAdminNotes.id,
          adminUserId: bookingAdminNotes.adminUserId,
          noteType: bookingAdminNotes.noteType,
          content: bookingAdminNotes.content,
          createdAt: bookingAdminNotes.createdAt,
          adminFirstName: noteAdmin.firstName,
          adminLastName: noteAdmin.lastName,
        })
        .from(bookingAdminNotes)
        .leftJoin(noteAdmin, eq(bookingAdminNotes.adminUserId, noteAdmin.id))
        .where(eq(bookingAdminNotes.bookingId, id))
        .orderBy(desc(bookingAdminNotes.createdAt)),
      db
        .select({
          id: bookingEvents.id,
          actorType: bookingEvents.actorType,
          actorId: bookingEvents.actorId,
          eventType: bookingEvents.eventType,
          channel: bookingEvents.channel,
          displayMessage: bookingEvents.displayMessage,
          content: bookingEvents.content,
          contactMethod: bookingEvents.contactMethod,
          metadata: bookingEvents.metadata,
          createdAt: bookingEvents.createdAt,
          actorFirstName: eventActor.firstName,
          actorLastName: eventActor.lastName,
          actorEmail: eventActor.email,
        })
        .from(bookingEvents)
        .leftJoin(eventActor, eq(bookingEvents.actorId, eventActor.id))
        .where(eq(bookingEvents.bookingId, id))
        .orderBy(desc(bookingEvents.createdAt)),
    ]);

    const pricing = pricingData[0];

    return {
      id: booking.id,
      bookingType: booking.bookingType,
      bookingStatus: booking.bookingStatus,
      source: booking.source,
      userId: booking.userId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      boatId: booking.boatId,
      pricingTierId: booking.pricingTierId,
      startDateTime: booking.startDateTime,
      endDateTime: booking.endDateTime,
      numberOfPassengers: booking.numberOfPassengers,
      isMultiDay: booking.isMultiDay,
      needsCaptain: booking.needsCaptain,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      assignedAdminId: booking.assignedAdminId,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      expiresAt: booking.expiresAt,
      paymentType: booking.paymentType,
      addOns: (booking.addOns ?? null) as Array<{
        name: string;
        description?: string | null;
        unitPrice: number;
        quantity: number;
        total: number;
      }> | null,

      pricing: pricing
        ? {
            basePriceCents: Number(pricing.basePriceCents),
            captainFeeCents: pricing.captainFeeCents ? Number(pricing.captainFeeCents) : null,
            cleaningFeeCents: pricing.cleaningFeeCents ? Number(pricing.cleaningFeeCents) : null,
            serviceFeeCents: pricing.serviceFeeCents ? Number(pricing.serviceFeeCents) : null,
            taxAmountCents: pricing.taxAmountCents ? Number(pricing.taxAmountCents) : null,
            discountAmountCents: pricing.discountAmountCents
              ? Number(pricing.discountAmountCents)
              : null,
            discountCode: pricing.discountCode,
            depositAmountCents: pricing.depositAmountCents
              ? Number(pricing.depositAmountCents)
              : null,
            totalAmountCents: Number(pricing.totalAmountCents),
            currency: pricing.currency,
            depositDueDate: pricing.depositDueDate,
            remainderDueDate: pricing.remainderDueDate,
          }
        : null,

      payments: paymentsData.map((p) => ({
        id: p.id,
        paymentType: p.paymentType,
        amountCents: Number(p.amountCents),
        currency: p.currency,
        status: p.status,
        paymentMethodType: p.paymentMethodType,
        paymentMethodDetail: p.paymentMethodDetail,
        stripePaymentIntentId: p.stripePaymentIntentId,
        stripePaymentLinkId: p.stripePaymentLinkId,
        processedAt: p.processedAt,
        createdAt: p.createdAt,
      })),

      statusHistory: historyData.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedByUserId: h.changedByUserId,
        changedByName:
          h.changedByFirstName && h.changedByLastName
            ? `${h.changedByFirstName} ${h.changedByLastName}`
            : null,
        reason: h.reason,
        createdAt: h.createdAt,
      })),

      adminNotes: notesData.map((n) => ({
        id: n.id,
        adminUserId: n.adminUserId,
        adminName:
          n.adminFirstName && n.adminLastName ? `${n.adminFirstName} ${n.adminLastName}` : null,
        noteType: n.noteType,
        content: n.content,
        createdAt: n.createdAt,
      })),

      activityEvents: eventsData.map((e) => ({
        id: e.id,
        actorType: e.actorType,
        eventType: e.eventType,
        channel: e.channel,
        displayMessage: e.displayMessage,
        content: e.content,
        contactMethod: e.contactMethod,
        metadata: e.metadata as Record<string, unknown> | null,
        createdAt: e.createdAt,
        actorName:
          e.actorFirstName || e.actorLastName
            ? `${e.actorFirstName || ""} ${e.actorLastName || ""}`.trim()
            : e.actorEmail || (e.actorType === "system" ? "System" : "—"),
      })),

      boat: {
        id: booking.boatId,
        name: booking.boatName ?? "",
        category: booking.boatCategory,
        mainImage: booking.boatMainImage,
        capacity: booking.boatCapacity,
        timezone: booking.boatTimezone,
        ownerId: booking.boatOwnerId,
      },

      user: booking.userId
        ? {
            id: booking.userId,
            firstName: booking.userFirstName,
            lastName: booking.userLastName,
            email: booking.userEmail ?? "",
            profileImage: booking.userProfileImage,
          }
        : null,

      assignedAdmin: booking.assignedAdminId
        ? {
            id: booking.assignedAdminId,
            firstName: booking.assignedAdminFirstName,
            lastName: booking.assignedAdminLastName,
            email: booking.assignedAdminEmail ?? "",
          }
        : null,
    };
  }

  // ==========================================================================
  // UPDATE OPERATIONS
  // ==========================================================================

  /**
   * Update booking status (creates history entry)
   * Delegates to status service for consistency
   */
  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    changedByUserId?: string,
    reason?: string
  ): Promise<Booking> {
    await bookingStatusService.forceSetStatus(
      id,
      status,
      reason ?? "Status updated",
      changedByUserId ?? null
    );

    const [updated] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (!updated) throw new Error(`Booking not found: ${id}`);
    return updated;
  }

  /**
   * Update booking fields (partial update with pricing recalculation)
   * @param updatedByUserId — admin who performed the edit (for audit log)
   */
  async updateBooking(
    id: string,
    updates: BookingUpdateInput,
    updatedByUserId?: string | null
  ): Promise<BookingDetails> {
    // Get current booking
    const current = await this.getBookingById(id);
    if (!current) {
      throw new Error(`Booking not found: ${id}`);
    }

    const beforeSnapshot = bookingAuditSnapshot(current);

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Simple field updates
    if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
    if (updates.customerEmail !== undefined) updateData.customerEmail = updates.customerEmail;
    if (updates.customerPhone !== undefined) updateData.customerPhone = updates.customerPhone;
    if (updates.numberOfPassengers !== undefined)
      updateData.numberOfPassengers = updates.numberOfPassengers;
    if (updates.needsCaptain !== undefined) updateData.needsCaptain = updates.needsCaptain;
    if (updates.pickupLocation !== undefined) updateData.pickupLocation = updates.pickupLocation;
    if (updates.dropoffLocation !== undefined) updateData.dropoffLocation = updates.dropoffLocation;

    // Handle date updates
    if (updates.startDateTime !== undefined) {
      updateData.startDateTime = toDateOrNull(updates.startDateTime);
    }
    if (updates.endDateTime !== undefined) {
      updateData.endDateTime = toDateOrNull(updates.endDateTime);
    }

    // Handle boat/pricing changes with recalculation
    const needsPricingRecalc =
      updates.boatId !== undefined ||
      updates.pricingTierId !== undefined ||
      updates.cleaningFee !== undefined ||
      updates.captainFee !== undefined;

    if (needsPricingRecalc && !updates.manualOverride) {
      const boatId = updates.boatId ?? current.boatId!;
      const pricingTierId = updates.pricingTierId;

      // Get boat and pricing tier
      const [boat] = await db
        .select({
          id: boats.id,
          cleaningFee: boats.cleaningFee,
          depositAmount: boats.depositAmount,
        })
        .from(boats)
        .where(eq(boats.id, boatId))
        .limit(1);

      if (!boat) {
        throw new Error(`Boat not found: ${boatId}`);
      }

      let basePrice = 0;
      if (pricingTierId) {
        const [tier] = await db
          .select({ price: boatPricingTiers.price })
          .from(boatPricingTiers)
          .where(eq(boatPricingTiers.id, pricingTierId))
          .limit(1);
        if (tier) basePrice = tier.price;
      } else if (updates.basePrice !== undefined) {
        basePrice = updates.basePrice;
      }

      const cleaningFee = updates.cleaningFee ?? boat.cleaningFee ?? 0;
      const captainFee = updates.captainFee ?? 0;

      const priceBreakdown = calculateBookingPriceFromDollars(basePrice, cleaningFee, captainFee);

      updateData.boatId = boatId;
      updateData.pricingTierId = pricingTierId;
      // Pricing lives in booking_pricing table only (migration 0014 removed from bookings)
      await db
        .update(bookingPricing)
        .set({
          basePriceCents: priceBreakdown.basePriceCents,
          cleaningFeeCents: priceBreakdown.cleaningFeeCents || null,
          captainFeeCents: priceBreakdown.captainFeeCents || null,
          serviceFeeCents: priceBreakdown.serviceFeeCents,
          totalAmountCents: priceBreakdown.totalPriceCents,
          depositAmountCents: dollarsToCents(boat.depositAmount ?? 0) || null,
        })
        .where(eq(bookingPricing.bookingId, id));
    } else if (updates.manualOverride && updates.totalAmount !== undefined) {
      // Manual override - update booking_pricing only (pricing columns removed from bookings)
      const manualPricingUpdates: Record<string, number | null> = {
        totalAmountCents: dollarsToCents(updates.totalAmount),
      };
      if (updates.cleaningFee != null)
        manualPricingUpdates.cleaningFeeCents = dollarsToCents(updates.cleaningFee);
      if (updates.captainFee != null)
        manualPricingUpdates.captainFeeCents = dollarsToCents(updates.captainFee);
      await db
        .update(bookingPricing)
        .set(manualPricingUpdates)
        .where(eq(bookingPricing.bookingId, id));
    }

    // Update the booking
    await db.update(bookings).set(updateData).where(eq(bookings.id, id));

    // Return the updated booking
    const updatedBooking = await this.getBookingById(id);
    if (!updatedBooking) {
      throw new Error(`Failed to retrieve updated booking: ${id}`);
    }

    if (updatedByUserId) {
      const afterSnapshot = bookingAuditSnapshot(updatedBooking);
      const changedFields: string[] = [];
      const previousState: Record<string, unknown> = {};
      const newState: Record<string, unknown> = {};
      for (const key of Object.keys(beforeSnapshot)) {
        const a = JSON.stringify(beforeSnapshot[key]);
        const b = JSON.stringify(afterSnapshot[key]);
        if (a !== b) {
          changedFields.push(key);
          previousState[key] = beforeSnapshot[key];
          newState[key] = afterSnapshot[key];
        }
      }
      if (changedFields.length > 0) {
        await bookingEventsService.logBookingUpdated({
          bookingId: id,
          actorId: updatedByUserId,
          previousState,
          newState,
          changedFields,
        });
      }
    }

    return updatedBooking;
  }

  /**
   * Assign admin to booking
   */
  async assignAdmin(bookingId: string, adminId: string, performedByUserId: string): Promise<void> {
    const [row] = await db
      .select({ assignedAdminId: bookings.assignedAdminId })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);
    const previous = row?.assignedAdminId ?? null;
    if (previous === adminId) return;
    await db
      .update(bookings)
      .set({
        assignedAdminId: adminId,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
    await bookingEventsService.logAssignedAdminChanged({
      bookingId,
      actorId: performedByUserId,
      previousAdminId: previous,
      newAdminId: adminId,
    });
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }
}

// Export singleton instance
export const bookingService = new BookingService();
