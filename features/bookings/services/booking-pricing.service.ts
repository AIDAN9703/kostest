/**
 * Booking Pricing Service
 * 
 * Business logic layer for booking pricing.
 * Uses direct database access (no repository layer).
 * 
 * All monetary values are in CENTS. The service fee rate comes from app
 * settings (admin-configurable) and is snapshotted onto each booking's
 * pricing row — settings changes never alter existing bookings.
 */

import { db } from '@/database/db';
import { bookingPricing } from '@/database/schema';
import { eq } from 'drizzle-orm';
import type { BookingPricing } from '@/database/types';
import type { Cents } from '@/shared/lib/utils/money-utils';
import { 
  calculateBookingPriceCents, 
  type BookingPriceBreakdownCents 
} from '@/shared/lib/utils/pricing-utils';
import { getAppSettings } from '@/features/app-settings/app-settings.service';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateBookingPricingInput {
  bookingId: string;
  basePriceCents: Cents;
  captainFeeCents?: Cents | null;
  cleaningFeeCents?: Cents | null;
  serviceFeeCents?: Cents | null;
  taxAmountCents?: Cents | null;
  discountAmountCents?: Cents | null;
  discountCode?: string | null;
  depositAmountCents?: Cents | null;
  totalAmountCents: Cents;
  currency?: string;
  depositDueDate?: Date | null;
  remainderDueDate?: Date | null;
}

export interface UpdateBookingPricingInput {
  basePriceCents?: Cents;
  captainFeeCents?: Cents | null;
  cleaningFeeCents?: Cents | null;
  serviceFeeCents?: Cents | null;
  taxAmountCents?: Cents | null;
  discountAmountCents?: Cents | null;
  discountCode?: string | null;
  depositAmountCents?: Cents | null;
  totalAmountCents?: Cents;
  depositDueDate?: Date | null;
  remainderDueDate?: Date | null;
}

/**
 * Simple pricing input for creating from base values
 * Service will calculate fees automatically.
 * Subtotal = base + add-ons + cleaning + captain; service fee (3.5%) applied to subtotal.
 */
export interface SimplePricingInput {
  basePriceCents: Cents;
  addOnsCents?: Cents;
  captainFeeCents?: Cents;
  cleaningFeeCents?: Cents;
  taxAmountCents?: Cents;
  discountAmountCents?: Cents;
  discountCode?: string | null;
  depositAmountCents?: Cents | null;
  currency?: string;
  depositDueDate?: Date | null;
  remainderDueDate?: Date | null;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class BookingPricingService {
  /**
   * Create pricing record for a booking
   */
  async createPricing(input: CreateBookingPricingInput): Promise<BookingPricing> {
    const [created] = await db
      .insert(bookingPricing)
      .values({
        bookingId: input.bookingId,
        basePriceCents: input.basePriceCents,
        captainFeeCents: input.captainFeeCents ?? null,
        cleaningFeeCents: input.cleaningFeeCents ?? null,
        serviceFeeCents: input.serviceFeeCents ?? null,
        taxAmountCents: input.taxAmountCents ?? null,
        discountAmountCents: input.discountAmountCents ?? null,
        discountCode: input.discountCode ?? null,
        depositAmountCents: input.depositAmountCents ?? null,
        totalAmountCents: input.totalAmountCents,
        currency: input.currency ?? 'USD',
        depositDueDate: input.depositDueDate ?? null,
        remainderDueDate: input.remainderDueDate ?? null,
      })
      .returning();
    
    return created;
  }

  /**
   * Create pricing from simple input - calculates service fee and total automatically
   */
  async createPricingWithCalculation(
    bookingId: string,
    input: SimplePricingInput
  ): Promise<BookingPricing> {
    // Calculate fees: subtotal = base + add-ons + cleaning + captain; service fee on subtotal
    const { serviceFeeRate } = await getAppSettings();
    const breakdown = calculateBookingPriceCents(
      input.basePriceCents,
      input.cleaningFeeCents ?? 0,
      input.captainFeeCents ?? 0,
      input.addOnsCents ?? 0,
      serviceFeeRate
    );

    // Apply tax and discount after service fee calculation
    const taxCents = input.taxAmountCents ?? 0;
    const discountCents = input.discountAmountCents ?? 0;
    const finalTotalCents = breakdown.totalPriceCents + taxCents - discountCents;

    return this.createPricing({
      bookingId,
      basePriceCents: breakdown.basePriceCents,
      captainFeeCents: breakdown.captainFeeCents || null,
      cleaningFeeCents: breakdown.cleaningFeeCents || null,
      serviceFeeCents: breakdown.serviceFeeCents,
      taxAmountCents: taxCents || null,
      discountAmountCents: discountCents || null,
      discountCode: input.discountCode,
      depositAmountCents: input.depositAmountCents,
      totalAmountCents: finalTotalCents,
      currency: input.currency,
      depositDueDate: input.depositDueDate,
      remainderDueDate: input.remainderDueDate,
    });
  }

  /**
   * Get pricing for a booking
   */
  async getPricingByBookingId(bookingId: string): Promise<BookingPricing | null> {
    const [pricing] = await db
      .select()
      .from(bookingPricing)
      .where(eq(bookingPricing.bookingId, bookingId))
      .limit(1);
    
    return pricing ?? null;
  }

  /**
   * Update pricing for a booking
   */
  async updatePricing(
    bookingId: string,
    updates: UpdateBookingPricingInput
  ): Promise<BookingPricing> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (updates.basePriceCents !== undefined) updateData.basePriceCents = updates.basePriceCents;
    if (updates.captainFeeCents !== undefined) updateData.captainFeeCents = updates.captainFeeCents;
    if (updates.cleaningFeeCents !== undefined) updateData.cleaningFeeCents = updates.cleaningFeeCents;
    if (updates.serviceFeeCents !== undefined) updateData.serviceFeeCents = updates.serviceFeeCents;
    if (updates.taxAmountCents !== undefined) updateData.taxAmountCents = updates.taxAmountCents;
    if (updates.discountAmountCents !== undefined) updateData.discountAmountCents = updates.discountAmountCents;
    if (updates.discountCode !== undefined) updateData.discountCode = updates.discountCode;
    if (updates.depositAmountCents !== undefined) updateData.depositAmountCents = updates.depositAmountCents;
    if (updates.totalAmountCents !== undefined) updateData.totalAmountCents = updates.totalAmountCents;
    if (updates.depositDueDate !== undefined) updateData.depositDueDate = updates.depositDueDate;
    if (updates.remainderDueDate !== undefined) updateData.remainderDueDate = updates.remainderDueDate;

    const [updated] = await db
      .update(bookingPricing)
      .set(updateData)
      .where(eq(bookingPricing.bookingId, bookingId))
      .returning();

    if (!updated) {
      throw new Error(`Pricing not found for booking: ${bookingId}`);
    }

    return updated;
  }

  /**
   * Update pricing with automatic recalculation
   * Call this when base price or fees change
   */
  async recalculatePricing(
    bookingId: string,
    input: SimplePricingInput
  ): Promise<BookingPricing> {
    const { serviceFeeRate } = await getAppSettings();
    const breakdown = calculateBookingPriceCents(
      input.basePriceCents,
      input.cleaningFeeCents ?? 0,
      input.captainFeeCents ?? 0,
      input.addOnsCents ?? 0,
      serviceFeeRate
    );

    const taxCents = input.taxAmountCents ?? 0;
    const discountCents = input.discountAmountCents ?? 0;
    const finalTotalCents = breakdown.totalPriceCents + taxCents - discountCents;

    return this.updatePricing(bookingId, {
      basePriceCents: breakdown.basePriceCents,
      captainFeeCents: breakdown.captainFeeCents || null,
      cleaningFeeCents: breakdown.cleaningFeeCents || null,
      serviceFeeCents: breakdown.serviceFeeCents,
      taxAmountCents: taxCents || null,
      discountAmountCents: discountCents || null,
      discountCode: input.discountCode,
      depositAmountCents: input.depositAmountCents,
      totalAmountCents: finalTotalCents,
      depositDueDate: input.depositDueDate,
      remainderDueDate: input.remainderDueDate,
    });
  }

  /**
   * Delete pricing for a booking (cascades from booking delete usually)
   */
  async deletePricing(bookingId: string): Promise<void> {
    await db
      .delete(bookingPricing)
      .where(eq(bookingPricing.bookingId, bookingId));
  }

  /**
   * Get price breakdown for display purposes
   */
  getPriceBreakdown(pricing: BookingPricing): BookingPriceBreakdownCents {
    return {
      basePriceCents: Number(pricing.basePriceCents),
      captainFeeCents: Number(pricing.captainFeeCents ?? 0),
      cleaningFeeCents: Number(pricing.cleaningFeeCents ?? 0),
      serviceFeeCents: Number(pricing.serviceFeeCents ?? 0),
      subtotalCents: Number(pricing.basePriceCents) + 
                     Number(pricing.captainFeeCents ?? 0) + 
                     Number(pricing.cleaningFeeCents ?? 0),
      totalPriceCents: Number(pricing.totalAmountCents),
    };
  }
}

// Export singleton instance
export const bookingPricingService = new BookingPricingService();
