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

import { db } from '@/database/db';
import { 
  bookings, 
  boats, 
  users, 
  boatPricingTiers,
  bookingPricing,
  bookingStatusHistory,
  bookingAdminNotes,
  bookingGroups,
  payments
} from '@/database/schema';
import { and, count, eq, desc, or, ilike, sql, gte, lte, aliasedTable, inArray } from 'drizzle-orm';

import { type BookingFilterInput, type BookingUpdateInput, type BookingCreateInput, type DraftBookingCreateInput, type CreateBookingsInput } from './booking.validation';
import { 
  type PaginatedBookingsResponse, 
  type BookingListItem, 
  type BookingDetails, 
  type BookingWithRelations,
  type BookingListItemNew,
  type PaginatedBookingsResponseNew,
} from './booking.types';
import { type Booking, type BookingStatus, type PaymentStatus, type BookingSource } from '@/database/types';
import { calculateBookingPriceFromDollars, calculateBookingPriceCents } from '@/shared/lib/utils/pricing-utils';
import { dollarsToCents, type Cents } from '@/shared/lib/utils/money-utils';
import { toDateOrNull, calculateEndDateTime } from '@/shared/lib/utils/date-helpers';
import type { SupportedTimezones } from '@/shared/lib/utils/date-helpers';
import { isValidUUID } from '@/shared/lib/utils/general-utils';
import { bookingGroupService } from '@/features/booking-groups/booking-group.service';
import { bookingPricingService } from './booking-pricing.service';
import { bookingStatusService } from './booking-status.service';
import { fetchBoatAndTier } from './booking-helpers';

// ============================================================================
// BOOKING SERVICE CLASS
// ============================================================================

export class BookingService {
  
  // ==========================================================================
  // CREATE OPERATIONS
  // ==========================================================================

  /**
   * Create a booking from admin flow
   * Uses transaction to create booking + pricing + status history atomically
   */
  async createAdminBooking(
    input: BookingCreateInput, 
    assignedAdminId?: string | null
  ): Promise<Booking> {
    const startDateTime = toDateOrNull(input.startDateTime);
    const endDateTime = toDateOrNull(input.endDateTime ?? null);

    if (!startDateTime) {
      throw new Error("Start date/time is required");
    }

    const { boat, tier } = await fetchBoatAndTier(input.boatId, input.pricingTierId);
    if (!tier) throw new Error(`Pricing tier not found: ${input.pricingTierId}`);

    const resolvedEndDateTime =
      endDateTime ?? calculateEndDateTime(startDateTime, tier.hours);

    // Calculate pricing in cents
    const priceBreakdown = calculateBookingPriceFromDollars(
      tier.price,
      boat.cleaningFee ?? 0,
      0 // captain fee
    );

    const depositAmountCents = dollarsToCents(boat.depositAmount ?? 0);

    const now = new Date();
    
    // Determine booking type and initial status
    const bookingType = input.bookingType || "EXTERNAL_BOOKING";
    const source = (input.source || "ADMIN") as BookingSource;
    
    // For EXTERNAL_BOOKING and admin-created, start as APPROVED
    // For REQUEST, start as PENDING
    const initialStatus = bookingType === "REQUEST" ? "PENDING" : "APPROVED";
    
    // 1. Create booking record
    const [newBooking] = await db
      .insert(bookings)
      .values({
        bookingType,
        bookingStatus: initialStatus,
        source,
        userId: input.userId ?? null,
        boatOwnerId: boat.ownerId,
        boatId: input.boatId,
        pricingTierId: input.pricingTierId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone ?? "",
        isMultiDay: false,
        needsCaptain: input.needsCaptain,
        startDateTime,
        endDateTime: resolvedEndDateTime,
        numberOfPassengers: input.numberOfPassengers,
        pickupLocation: input.pickupLocation ?? null,
        dropoffLocation: input.dropoffLocation ?? null,
        specialRequests: input.specialRequests ?? null,
        inquiryId: input.inquiryId ?? null,
        assignedAdminId: assignedAdminId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // 2. Create pricing record in new table
    await db
      .insert(bookingPricing)
      .values({
        bookingId: newBooking.id,
        basePriceCents: priceBreakdown.basePriceCents,
        captainFeeCents: priceBreakdown.captainFeeCents || null,
        cleaningFeeCents: priceBreakdown.cleaningFeeCents || null,
        serviceFeeCents: priceBreakdown.serviceFeeCents,
        taxAmountCents: null,
        discountAmountCents: null,
        depositAmountCents: depositAmountCents || null,
        totalAmountCents: priceBreakdown.totalPriceCents,
        currency: "USD",
      });

    // 3. Create initial status history entry
    await bookingStatusService.createInitialHistory(
      newBooking.id,
      initialStatus,
      assignedAdminId,
      bookingType === "REQUEST" ? "Booking request created by admin" : "Admin created booking"
    );

    return newBooking;
  }

  /**
   * Create draft bookings - multi-boat, optionally in group, optionally published
   * When publishNow=true, assigns publicToken for shareable link.
   */
  async createDraftBookings(
    input: DraftBookingCreateInput,
    assignedAdminId?: string | null
  ): Promise<{ bookingIds: string[]; publicToken: string | null; groupId: string | null }> {
    const startDateTime = toDateOrNull(input.startDateTime);
    const endDateTime = toDateOrNull(input.endDateTime ?? null);
    const expiresAt = toDateOrNull(input.expiresAt ?? null);

    if (!startDateTime) {
      throw new Error("Start date/time is required");
    }

    const now = new Date();
    const boatIds = [...new Set(input.boatOptions.map((o) => o.boatId))];

    const boatsRows = await db
      .select({
        id: boats.id,
        name: boats.name,
        mainImage: boats.mainImage,
        ownerId: boats.ownerId,
        cleaningFee: boats.cleaningFee,
        depositAmount: boats.depositAmount,
        crewRequired: boats.crewRequired,
      })
      .from(boats)
      .where(inArray(boats.id, boatIds));

    const boatsById = new Map(boatsRows.map((b) => [b.id, b]));

    const tiersRows = await db
      .select({
        id: boatPricingTiers.id,
        boatId: boatPricingTiers.boatId,
        hours: boatPricingTiers.hours,
        price: boatPricingTiers.price,
      })
      .from(boatPricingTiers)
      .where(
        inArray(
          boatPricingTiers.id,
          input.boatOptions.map((o) => o.pricingTierId)
        )
      );

    const tiersById = new Map(tiersRows.map((t) => [t.id, t]));

    let groupId: string | null = null;
    if (input.boatOptions.length > 1 || input.groupName) {
      const group = await bookingGroupService.create({
        name: input.groupName ?? `Booking Group ${now.toLocaleDateString()}`,
        notes: null,
        createdById: assignedAdminId ?? null,
      });
      groupId = group.id;
    }

    const publicToken = input.publishNow ? crypto.randomUUID() : null;

    const bookingIds: string[] = [];
    const primaryIndex = input.boatOptions.findIndex((o) => o.isPrimary);
    const primaryIdx = primaryIndex >= 0 ? primaryIndex : 0;

    for (let i = 0; i < input.boatOptions.length; i++) {
      const option = input.boatOptions[i];
      const boat = boatsById.get(option.boatId);
      const tier = tiersById.get(option.pricingTierId);

      if (!boat) throw new Error(`Boat not found: ${option.boatId}`);
      if (!tier) throw new Error(`Pricing tier not found: ${option.pricingTierId}`);

      const basePrice = option.basePrice ?? tier.price;
      const resolvedEndDateTime =
        endDateTime ?? calculateEndDateTime(startDateTime, tier.hours);

      const lineItemsForBoat = i === primaryIdx ? input.lineItems ?? [] : [];
      const lineItemsTotal = lineItemsForBoat.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const totalBasePrice = basePrice + lineItemsTotal;

      const priceBreakdown = calculateBookingPriceCents(
        dollarsToCents(totalBasePrice),
        dollarsToCents(boat.cleaningFee ?? 0),
        0
      );
      const depositCents = dollarsToCents(boat.depositAmount ?? 0);

      const addOnsPayload = lineItemsForBoat.map((item) => ({
        name: item.name,
        description: item.description ?? null,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      }));

      const isFirst = i === 0;
      const tokenForThisBooking = input.publishNow && isFirst ? publicToken : null;

      const [booking] = await db
        .insert(bookings)
        .values({
          bookingType: "EXTERNAL_BOOKING",
          bookingStatus: "DRAFT",
          source: "ADMIN" as BookingSource,
          userId: input.userId ?? null,
          boatOwnerId: boat.ownerId,
          boatId: boat.id,
          pricingTierId: tier.id,
          bookingGroupId: groupId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone ?? "",
          isMultiDay: false,
          needsCaptain: boat.crewRequired,
          startDateTime,
          endDateTime: resolvedEndDateTime,
          numberOfPassengers: input.numberOfPassengers,
          pickupLocation: input.pickupLocation ?? null,
          dropoffLocation: input.dropoffLocation ?? null,
          specialRequests: input.specialRequests ?? null,
          adminNotes: input.adminNotes ?? null,
          addOns: addOnsPayload.length > 0 ? addOnsPayload : null,
          inquiryId: input.inquiryId ?? null,
          assignedAdminId: assignedAdminId ?? null,
          publicToken: tokenForThisBooking,
          allowPayment: input.allowPayment ?? false,
          paymentType: input.paymentType ?? "FULL_PAYMENT",
          publishedAt: input.publishNow ? now : null,
          expiresAt,
        })
        .returning({ id: bookings.id });

      await bookingPricingService.createPricingWithCalculation(booking.id, {
        basePriceCents: dollarsToCents(totalBasePrice),
        cleaningFeeCents: dollarsToCents(boat.cleaningFee ?? 0),
        depositAmountCents: depositCents || undefined,
        currency: "USD",
      });

      await bookingStatusService.createInitialHistory(
        booking.id,
        "DRAFT",
        assignedAdminId,
        "Draft booking created"
      );

      bookingIds.push(booking.id);
    }

    return {
      bookingIds,
      publicToken,
      groupId,
    };
  }

  /**
   * Create multiple bookings in a group - unified flow with per-booking customer/dates
   */
  async createBookings(
    input: CreateBookingsInput,
    assignedAdminId?: string | null
  ): Promise<{ bookingIds: string[]; publicToken: string | null; groupId: string | null }> {
    const now = new Date();
    const boatIds = [...new Set(input.bookings.map((b) => b.boatId))];

    const boatsRows = await db
      .select({
        id: boats.id,
        name: boats.name,
        mainImage: boats.mainImage,
        ownerId: boats.ownerId,
        cleaningFee: boats.cleaningFee,
        depositAmount: boats.depositAmount,
        crewRequired: boats.crewRequired,
      })
      .from(boats)
      .where(inArray(boats.id, boatIds));
    const boatsById = new Map(boatsRows.map((b) => [b.id, b]));

    const tierIds = input.bookings
      .map((b) => b.pricingTierId)
      .filter((id): id is string => !!id);
    const tiersRows =
      tierIds.length > 0
        ? await db
            .select({
              id: boatPricingTiers.id,
              boatId: boatPricingTiers.boatId,
              hours: boatPricingTiers.hours,
              price: boatPricingTiers.price,
            })
            .from(boatPricingTiers)
            .where(inArray(boatPricingTiers.id, tierIds))
        : [];
    const tiersById = new Map(tiersRows.map((t) => [t.id, t]));

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
      if (b.pricingTierId && !tier)
        throw new Error(`Pricing tier not found: ${b.pricingTierId}`);

      const basePrice = tier ? (b.basePrice ?? tier.price) : b.basePrice;
      if (basePrice == null || basePrice < 0)
        throw new Error("Base price is required and must be positive");

      const startDateTime = new Date(b.startDateTime);
      const endDateTime = b.endDateTime
        ? new Date(b.endDateTime)
        : tier
          ? calculateEndDateTime(startDateTime, tier.hours)
          : null;
      if (!endDateTime)
        throw new Error("End date & time is required for custom pricing");

      const addOnsForThisBooking = i === 0 ? (input.lineItems ?? []) : [];
      const addOnsTotal = addOnsForThisBooking.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const totalBasePrice = basePrice + addOnsTotal;

      const priceBreakdown = calculateBookingPriceCents(
        dollarsToCents(totalBasePrice),
        dollarsToCents(boat.cleaningFee ?? 0),
        0
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

      const expiresAt = toDateOrNull(input.expiresAt ?? null);
      const tokenForThisBooking = i === 0 ? publicToken : null;

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
          specialRequests: input.specialRequests ?? null,
          adminNotes: input.adminNotes ?? null,
          addOns: addOnsPayload.length > 0 ? addOnsPayload : null,
          inquiryId: input.inquiryId ?? null,
          assignedAdminId: assignedAdminId ?? null,
          publicToken: tokenForThisBooking,
          allowPayment: input.allowPayment ?? false,
          paymentType: input.paymentType ?? "FULL_PAYMENT",
          publishedAt: now,
          expiresAt,
        })
        .returning({ id: bookings.id });

      await bookingPricingService.createPricingWithCalculation(booking.id, {
        basePriceCents: dollarsToCents(totalBasePrice),
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
      db.select({ id: boats.id, name: boats.name, mainImage: boats.mainImage }).from(boats).where(inArray(boats.id, boatIds)),
      db.select().from(bookingPricing).where(inArray(bookingPricing.bookingId, draftBookings.map((b) => b.id))),
    ]);
    const boatsById = new Map(boatsRows.map((b) => [b.id, b]));
    const pricingByBooking = new Map(pricingRows.map((p) => [p.bookingId, p]));

    const first = draftBookings[0];
    return {
      ...first,
      bookings: draftBookings.map((b) => {
        const boat = boatsById.get(b.boatId);
        const pricing = pricingByBooking.get(b.id);
        return {
          ...b,
          boatName: boat?.name ?? "Charter",
          boatMainImage: boat?.mainImage ?? null,
          totalCents: pricing ? Number(pricing.totalAmountCents) : 0,
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
  }): Promise<{ bookingIds: string[]; hostedInvoiceUrl?: string | null }> {
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

    let hostedInvoiceUrl: string | null = null;
    if (input.payNow && draftBookings[0].allowPayment && bookingIds.length > 0) {
      try {
        const { createDraftBookingInvoice } = await import(
          "@/features/bookings/booking-invoice.service"
        );
        const result = await createDraftBookingInvoice(
          draftBookings[0],
          bookingIds[0]
        );
        hostedInvoiceUrl = result.hostedInvoiceUrl;
      } catch (err) {
        console.error("Failed to create draft booking invoice:", err);
      }
    }

    return { bookingIds, hostedInvoiceUrl };
  }

  /**
   * Create a customer booking request
   */
  async createBookingRequest(
    input: {
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
      specialRequests?: string | null;
    }
  ): Promise<Booking> {
    const { boat, tier } = await fetchBoatAndTier(input.boatId, input.pricingTierId);
    if (!tier) throw new Error(`Pricing tier not found: ${input.pricingTierId}`);

    const resolvedEndDateTime = input.endDateTime ?? calculateEndDateTime(input.startDateTime, tier.hours);
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
        specialRequests: input.specialRequests ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(bookingPricing).values({
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
  async createInstantBooking(
    input: {
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
      specialRequests?: string | null;
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
    }
  ): Promise<Booking> {
    const { boat, tier } = await fetchBoatAndTier(input.boatId, input.pricingTierId);

    let priceBreakdown: { basePriceCents: number; captainFeeCents: number; cleaningFeeCents: number; serviceFeeCents: number; totalPriceCents: number };
    let depositAmountCents: number;
    let resolvedEndDateTime: Date | null;

    if (input.pricingOverrideCents) {
      priceBreakdown = input.pricingOverrideCents;
      depositAmountCents = input.pricingOverrideCents.depositAmountCents ?? 0;
      resolvedEndDateTime = input.endDateTime;
    } else {
      if (!tier) throw new Error("pricingTierId or pricingOverrideCents required");
      resolvedEndDateTime = input.endDateTime ?? calculateEndDateTime(input.startDateTime, tier.hours);
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
        specialRequests: input.specialRequests ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Create pricing record
    await db.insert(bookingPricing).values({
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
   * @deprecated Use getAllBookingsNew for cents-based responses
   */
  async getAllBookings(filters?: BookingFilterInput): Promise<PaginatedBookingsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (filters?.search) {
      whereConditions.push(or(
        ilike(bookings.customerName || '', `%${filters.search}%`),
        ilike(bookings.customerEmail || '', `%${filters.search}%`),
        ilike(bookings.customerPhone || '', `%${filters.search}%`),
        ilike(boats.name || '', `%${filters.search}%`)
      ));
    }

    if (filters?.bookingStatus) {
      whereConditions.push(eq(bookings.bookingStatus, filters.bookingStatus));
    }
    // Payment status filter - use EXISTS to avoid duplicate rows from multiple payments per booking
    if (filters?.paymentStatus) {
      whereConditions.push(
        sql`EXISTS (
          SELECT 1 FROM payment p 
          WHERE p.payable_type = 'BOOKING' 
          AND p.payable_id = ${bookings.id} 
          AND p.status = ${filters.paymentStatus}
        )`
      );
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

    const assignedAdmin = aliasedTable(users, 'assignedAdmin');

    const selectFields = {
      id: bookings.id,
      bookingType: bookings.bookingType,
      bookingStatus: bookings.bookingStatus,
      // Payment status from latest payment (subquery avoids duplicate rows when booking has multiple payments)
      paymentStatus: sql<string>`(
        SELECT p.status FROM payment p 
        WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
        ORDER BY p.created_at DESC LIMIT 1
      )`.as('paymentStatus'),
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
      // contactedAt removed - derive from booking_admin_notes (first note with type CONTACTED)
    };

    const [bookingsData, countResult] = await Promise.all([
      db.select(selectFields)
        .from(bookings)
        .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .leftJoin(bookingGroups, eq(bookings.bookingGroupId, bookingGroups.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(assignedAdmin, eq(bookings.assignedAdminId, assignedAdmin.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(bookings.createdAt)),
      db.select({ value: count() })
        .from(bookings)
        .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .where(whereClause)
    ]);

    // Map results, defaulting to 0 cents if no pricing record, PENDING if no payment
    const mappedBookings: BookingListItem[] = bookingsData.map(b => ({
      ...b,
      totalAmountCents: b.totalAmountCents ?? 0,
      currency: b.currency ?? 'USD',
      paymentStatus: (b.paymentStatus ?? 'PENDING') as PaymentStatus,
    }));

    return {
      bookings: mappedBookings,
      totalCount: countResult[0].value,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].value / limit)
    };
  }

  /**
   * Get single booking by ID with full details
   * Pricing comes from booking_pricing table (in cents)
   */
  async getBookingById(id: string): Promise<BookingDetails | null> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const assignedAdmin = aliasedTable(users, 'assignedAdmin');
    const boatOwner = aliasedTable(users, 'boatOwner');

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
        // Payment info - subquery for latest payment (avoids duplicate rows)
        paymentStatus: sql<string>`(
          SELECT p.status FROM payment p 
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
          ORDER BY p.created_at DESC LIMIT 1
        )`.as('paymentStatus'),
        paymentMethod: sql<string>`(
          SELECT p.payment_method_type FROM payment p 
          WHERE p.payable_type = 'BOOKING' AND p.payable_id = ${bookings.id} 
          ORDER BY p.created_at DESC LIMIT 1
        )`.as('paymentMethod'),
        // refundAmountCents removed - calculate from payments table if needed
        specialRequests: bookings.specialRequests,
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
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(boatOwner, eq(bookings.boatOwnerId, boatOwner.id))
      .leftJoin(assignedAdmin, eq(bookings.assignedAdminId, assignedAdmin.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) return null;

    // Map to BookingDetails with defaults
    return {
      ...booking,
      totalAmountCents: booking.totalAmountCents ?? 0,
      currency: booking.currency ?? 'USD',
      paymentStatus: booking.paymentStatus ?? 'PENDING',
      paymentMethod: booking.paymentMethod ?? null,
    } as unknown as BookingDetails;
  }

  /**
   * Get booking with all related data (pricing, payments, history, notes)
   */
  async getBookingWithRelations(id: string): Promise<BookingWithRelations | null> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const assignedAdmin = aliasedTable(users, 'assignedAdmin');
    const noteAdmin = aliasedTable(users, 'noteAdmin');
    const historyUser = aliasedTable(users, 'historyUser');

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
        specialRequests: bookings.specialRequests,
        assignedAdminId: bookings.assignedAdminId,
        cancelledAt: bookings.cancelledAt,
        cancellationReason: bookings.cancellationReason,
        cancelledBy: bookings.cancelledBy,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        expiresAt: bookings.expiresAt,
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
    const [pricingData, paymentsData, historyData, notesData] = await Promise.all([
      db.select().from(bookingPricing).where(eq(bookingPricing.bookingId, id)).limit(1),
      db.select().from(payments).where(and(eq(payments.payableType, 'BOOKING'), eq(payments.payableId, id))).orderBy(desc(payments.createdAt)),
      db.select({
        id: bookingStatusHistory.id,
        fromStatus: bookingStatusHistory.fromStatus,
        toStatus: bookingStatusHistory.toStatus,
        changedByUserId: bookingStatusHistory.changedByUserId,
        reason: bookingStatusHistory.reason,
        createdAt: bookingStatusHistory.createdAt,
        changedByFirstName: historyUser.firstName,
        changedByLastName: historyUser.lastName,
      }).from(bookingStatusHistory)
        .leftJoin(historyUser, eq(bookingStatusHistory.changedByUserId, historyUser.id))
        .where(eq(bookingStatusHistory.bookingId, id))
        .orderBy(desc(bookingStatusHistory.createdAt)),
      db.select({
        id: bookingAdminNotes.id,
        adminUserId: bookingAdminNotes.adminUserId,
        noteType: bookingAdminNotes.noteType,
        content: bookingAdminNotes.content,
        createdAt: bookingAdminNotes.createdAt,
        adminFirstName: noteAdmin.firstName,
        adminLastName: noteAdmin.lastName,
      }).from(bookingAdminNotes)
        .leftJoin(noteAdmin, eq(bookingAdminNotes.adminUserId, noteAdmin.id))
        .where(eq(bookingAdminNotes.bookingId, id))
        .orderBy(desc(bookingAdminNotes.createdAt)),
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
      specialRequests: booking.specialRequests,
      assignedAdminId: booking.assignedAdminId,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      expiresAt: booking.expiresAt,
      
      pricing: pricing ? {
        basePriceCents: Number(pricing.basePriceCents),
        captainFeeCents: pricing.captainFeeCents ? Number(pricing.captainFeeCents) : null,
        cleaningFeeCents: pricing.cleaningFeeCents ? Number(pricing.cleaningFeeCents) : null,
        serviceFeeCents: pricing.serviceFeeCents ? Number(pricing.serviceFeeCents) : null,
        taxAmountCents: pricing.taxAmountCents ? Number(pricing.taxAmountCents) : null,
        discountAmountCents: pricing.discountAmountCents ? Number(pricing.discountAmountCents) : null,
        discountCode: pricing.discountCode,
        depositAmountCents: pricing.depositAmountCents ? Number(pricing.depositAmountCents) : null,
        totalAmountCents: Number(pricing.totalAmountCents),
        currency: pricing.currency,
        depositDueDate: pricing.depositDueDate,
        remainderDueDate: pricing.remainderDueDate,
      } : null,
      
      payments: paymentsData.map(p => ({
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
      
      statusHistory: historyData.map(h => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedByUserId: h.changedByUserId,
        changedByName: h.changedByFirstName && h.changedByLastName 
          ? `${h.changedByFirstName} ${h.changedByLastName}` 
          : null,
        reason: h.reason,
        createdAt: h.createdAt,
      })),
      
      adminNotes: notesData.map(n => ({
        id: n.id,
        adminUserId: n.adminUserId,
        adminName: n.adminFirstName && n.adminLastName 
          ? `${n.adminFirstName} ${n.adminLastName}` 
          : null,
        noteType: n.noteType,
        content: n.content,
        createdAt: n.createdAt,
      })),
      
      boat: {
        id: booking.boatId,
        name: booking.boatName ?? '',
        category: booking.boatCategory,
        mainImage: booking.boatMainImage,
        capacity: booking.boatCapacity,
        timezone: booking.boatTimezone,
        ownerId: booking.boatOwnerId,
      },
      
      user: booking.userId ? {
        id: booking.userId,
        firstName: booking.userFirstName,
        lastName: booking.userLastName,
        email: booking.userEmail ?? '',
        profileImage: booking.userProfileImage,
      } : null,
      
      assignedAdmin: booking.assignedAdminId ? {
        id: booking.assignedAdminId,
        firstName: booking.assignedAdminFirstName,
        lastName: booking.assignedAdminLastName,
        email: booking.assignedAdminEmail ?? '',
      } : null,
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
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    await bookingStatusService.forceSetStatus(
      id,
      status,
      reason ?? 'Status updated',
      changedByUserId ?? null
    );

    const [updated] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!updated) throw new Error(`Booking not found: ${id}`);
    return updated;
  }

  /**
   * @deprecated Payment link ID is now stored in payments table, not on bookings
   * This method is kept for backward compatibility but does nothing
   */
  async updatePaymentLinkId(id: string, paymentLinkId: string): Promise<void> {
    // Payment link ID is stored in payments table, not bookings table
    // This method is a no-op for backward compatibility
  }

  /**
   * Update payment status - updates the payment record in payments table
   * Returns the updated booking for convenience
   */
  async updatePaymentStatus(bookingId: string, status: PaymentStatus): Promise<Booking | null> {
    if (!isValidUUID(bookingId)) {
      throw new Error(`Invalid UUID format: ${bookingId}`);
    }

    // Find the payment record for this booking
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.payableType, 'BOOKING'),
        eq(payments.payableId, bookingId)
      ))
      .limit(1);

    if (payment) {
      // Update the payment status
      // Note: payments table doesn't have updatedAt field, only createdAt and processedAt
      await db
        .update(payments)
        .set({ 
          status,
        })
        .where(eq(payments.id, payment.id));
    }

    // Return the booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    return booking ?? null;
  }

  /**
   * Update booking fields (partial update with pricing recalculation)
   */
  async updateBooking(id: string, updates: BookingUpdateInput): Promise<BookingDetails> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Get current booking
    const current = await this.getBookingById(id);
    if (!current) {
      throw new Error(`Booking not found: ${id}`);
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Simple field updates
    if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
    if (updates.customerEmail !== undefined) updateData.customerEmail = updates.customerEmail;
    if (updates.customerPhone !== undefined) updateData.customerPhone = updates.customerPhone;
    if (updates.numberOfPassengers !== undefined) updateData.numberOfPassengers = updates.numberOfPassengers;
    if (updates.needsCaptain !== undefined) updateData.needsCaptain = updates.needsCaptain;
    if (updates.pickupLocation !== undefined) updateData.pickupLocation = updates.pickupLocation;
    if (updates.dropoffLocation !== undefined) updateData.dropoffLocation = updates.dropoffLocation;
    if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;

    // Handle date updates
    if (updates.startDateTime !== undefined) {
      updateData.startDateTime = toDateOrNull(updates.startDateTime);
    }
    if (updates.endDateTime !== undefined) {
      updateData.endDateTime = toDateOrNull(updates.endDateTime);
    }

    // Handle boat/pricing changes with recalculation
    const needsPricingRecalc = updates.boatId !== undefined || 
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
      if (updates.cleaningFee != null) manualPricingUpdates.cleaningFeeCents = dollarsToCents(updates.cleaningFee);
      if (updates.captainFee != null) manualPricingUpdates.captainFeeCents = dollarsToCents(updates.captainFee);
      await db
        .update(bookingPricing)
        .set(manualPricingUpdates)
        .where(eq(bookingPricing.bookingId, id));
    }

    // Update the booking
    await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id));

    // Return the updated booking
    const updatedBooking = await this.getBookingById(id);
    if (!updatedBooking) {
      throw new Error(`Failed to retrieve updated booking: ${id}`);
    }

    return updatedBooking;
  }

  /**
   * Assign admin to booking
   */
  async assignAdmin(bookingId: string, adminId: string): Promise<Booking> {
    if (!isValidUUID(bookingId) || !isValidUUID(adminId)) {
      throw new Error(`Invalid UUID format`);
    }

    const [booking] = await db
      .update(bookings)
      .set({ 
        assignedAdminId: adminId,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return booking;
  }

  /**
   * Unassign admin from booking
   */
  async unassignAdmin(bookingId: string): Promise<Booking> {
    if (!isValidUUID(bookingId)) {
      throw new Error(`Invalid UUID format: ${bookingId}`);
    }

    const [booking] = await db
      .update(bookings)
      .set({ 
        assignedAdminId: null,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return booking;
  }

  /**
   * Mark booking as contacted (creates admin note)
   * contactedAt is now derived from booking_admin_notes table
   */
  async markAsContacted(bookingId: string, adminId?: string): Promise<Booking> {
    if (!isValidUUID(bookingId)) {
      throw new Error(`Invalid UUID format: ${bookingId}`);
    }

    if (!adminId) {
      throw new Error("Admin ID required to mark as contacted");
    }

    // Create admin note (this replaces the contactedAt field)
    await db.insert(bookingAdminNotes).values({
      bookingId,
      adminUserId: adminId,
      noteType: 'CONTACTED',
      content: 'Customer contacted',
    });

    // Update updatedAt timestamp
    const [updated] = await db
      .update(bookings)
      .set({ 
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return updated;
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    await db.delete(bookings).where(eq(bookings.id, id));
  }

}

// Export singleton instance
export const bookingService = new BookingService();
