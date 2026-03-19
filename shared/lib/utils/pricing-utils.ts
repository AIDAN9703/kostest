import { Boat, PricingTier } from "../types/types";
import { formatCurrency } from "./general-utils";
import { SERVICE_FEE_RATE } from "@/shared/lib/constants/fees-constants";

import { dollarsToCents, type Cents } from "./money-utils";
import { BoatWithTiers } from "@/features/boats/boat.types";
/**
 * Minimal boat type for pricing functions - only requires fields actually used
 */
type BoatForPricing = {
  pricingTiers?: PricingTier[] | null;
  hourlyRate?: number | null;
};

/**
 * Gets the default or best pricing tier for a boat
 * Professional approach to handle pricing from a related table
 */
export function getDefaultPricingTier(boat: BoatForPricing): PricingTier | null {
  if (!boat.pricingTiers || boat.pricingTiers.length === 0) {
    return null;
  }

  // Prefer only active tiers for any display logic
  const activeTiers = boat.pricingTiers.filter((tier) => tier.isActive);
  if (activeTiers.length === 0) {
    return null;
  }

  // If any active tier is explicitly marked default, return the cheapest among them
  const activeDefaultTiers = activeTiers.filter((tier) => tier.isDefault);
  if (activeDefaultTiers.length > 0) {
    return activeDefaultTiers.reduce((cheapest, tier) => {
      if (tier.price < cheapest.price) return tier;
      if (tier.price === cheapest.price) {
        // Break ties by the shortest hours to represent a true "starting from"
        if ((tier.hours ?? Infinity) < (cheapest.hours ?? Infinity)) return tier;
      }
      return cheapest;
    }, activeDefaultTiers[0]);
  }

  // Otherwise, choose the overall cheapest active tier; tie-break by shortest hours
  const cheapestActiveTier = activeTiers.reduce((cheapest, tier) => {
    if (tier.price < cheapest.price) return tier;
    if (tier.price === cheapest.price) {
      if ((tier.hours ?? Infinity) < (cheapest.hours ?? Infinity)) return tier;
    }
    return cheapest;
  }, activeTiers[0]);

  return cheapestActiveTier ?? null;
}

/**
 * Gets the default price for a boat for display purposes only
 * This should only be used for showing a "starting from" price
 * Accepts partial boat objects - only needs pricingTiers and hourlyRate
 */
export function getBoatDefaultPrice(boat: BoatForPricing): number {
  // Try from pricing tiers first
  const defaultTier = getDefaultPricingTier(boat);
  if (defaultTier) return defaultTier.price;

  // Fallback to deprecated hourlyRate if it exists
  return boat.hourlyRate || 0;
}

/**
 * Gets the display hours for a boat's default pricing tier
 * This should only be used for showing a "starting from" duration
 * Accepts partial boat objects - only needs pricingTiers
 */
export function getBoatDefaultHours(boat: BoatForPricing): string {
  const defaultTier = getDefaultPricingTier(boat);
  if (defaultTier) return `${defaultTier.hours}hr`;

  return "hr";
}

/**
 * Compute the lowest price-per-hour across active tiers for "from $X+/hr" display
 */
export function getBoatStartingHourlyRate(boat: BoatWithTiers): number {
  const activeTiers = boat.pricingTiers?.filter((tier) => tier.isActive) ?? [];
  if (activeTiers.length > 0) {
    const minPerHour = activeTiers.reduce((min, tier) => {
      const hours = Math.max(1, tier.hours || 0);
      const perHour = tier.price / hours;
      return perHour < min ? perHour : min;
    }, Infinity);
    return Number.isFinite(minPerHour) ? Math.max(0, Math.round(minPerHour)) : 0;
  }
  return 0;
}

/**
 * Convenience formatter for UI labels like "from $450+/hr"
 */
export function getBoatStartingHourlyLabel(boat: BoatWithTiers): string {
  const hourly = getBoatStartingHourlyRate(boat);
  return `${formatCurrency(hourly)}+/hour`;
}

// ========================================
// CENTS-BASED PRICING (NEW - Use for all database operations)
// All values in cents for precision
// ========================================

/**
 * Price breakdown in CENTS - for database storage and calculations
 * All monetary values are integers representing cents
 */
export interface BookingPriceBreakdownCents {
  basePriceCents: Cents;
  captainFeeCents: Cents;
  cleaningFeeCents: Cents;
  subtotalCents: Cents;
  serviceFeeCents: Cents;
  totalPriceCents: Cents;
}

/**
 * Calculate service fee in cents based on subtotal in cents
 */
export const calculateServiceFeeCents = (subtotalCents: Cents): Cents => {
  return Math.round(subtotalCents * SERVICE_FEE_RATE);
};

/**
 * MAIN booking price calculator in CENTS - use for all database operations
 *
 * Order: base (charter) + add-ons + cleaning + captain = subtotal, then 3.5% fee on subtotal = total
 *
 * @param basePriceCents - Charter base price only (in cents)
 * @param cleaningFeeCents - One-time cleaning fee in cents (optional)
 * @param captainFeeCents - Captain service fee in cents (optional)
 * @param addOnsCents - Add-ons total in cents (optional)
 * @returns Complete price breakdown with all fees in cents
 */
export const calculateBookingPriceCents = (
  basePriceCents: Cents,
  cleaningFeeCents: Cents = 0,
  captainFeeCents: Cents = 0,
  addOnsCents: Cents = 0
): BookingPriceBreakdownCents => {
  const subtotalCents = basePriceCents + addOnsCents + captainFeeCents + cleaningFeeCents;
  const serviceFeeCents = calculateServiceFeeCents(subtotalCents);
  const totalPriceCents = subtotalCents + serviceFeeCents;

  return {
    basePriceCents,
    captainFeeCents,
    cleaningFeeCents,
    subtotalCents,
    serviceFeeCents,
    totalPriceCents,
  };
};

/**
 * Calculate booking price from DOLLAR inputs, returns CENTS
 * Convenience function for when inputs come from forms/UI in dollars
 *
 * @param basePriceDollars - Base price from pricing tier (in dollars)
 * @param cleaningFeeDollars - One-time cleaning fee in dollars (optional)
 * @param captainFeeDollars - Captain service fee in dollars (optional)
 * @returns Complete price breakdown with all fees in cents
 */
export const calculateBookingPriceFromDollars = (
  basePriceDollars: number,
  cleaningFeeDollars: number = 0,
  captainFeeDollars: number = 0
): BookingPriceBreakdownCents => {
  return calculateBookingPriceCents(
    dollarsToCents(basePriceDollars),
    dollarsToCents(cleaningFeeDollars),
    dollarsToCents(captainFeeDollars)
  );
};

// ========================================
// LEGACY DOLLAR-BASED PRICING (for backward compatibility)
// Will be deprecated - use cents versions above
// ========================================

// UNIVERSAL price breakdown interface - used everywhere
/** @deprecated Use BookingPriceBreakdownCents instead */
export interface BookingPriceBreakdown {
  basePrice: number;
  captainFee: number;
  cleaningFee: number;
  subtotal: number;
  serviceFee: number;
  totalPrice: number;
}

/**
 * Calculate service fee based on subtotal
 * @deprecated Use calculateServiceFeeCents instead
 */
export const calculateServiceFee = (subtotal: number): number => {
  return subtotal * SERVICE_FEE_RATE;
};

/**
 * MAIN booking price calculator - single source of truth
 * Use this everywhere for consistent pricing
 *
 * @deprecated Use calculateBookingPriceCents instead
 *
 * @param pricingTierPrice - Base price from pricing tier
 * @param cleaningFee - One-time cleaning fee (optional)
 * @param captainFee - Captain service fee (optional, usually 0 as included in base)
 * @returns Complete price breakdown with all fees
 */
export const calculateBookingPrice = (
  pricingTierPrice: number,
  cleaningFee: number = 0,
  captainFee: number = 0
): BookingPriceBreakdown => {
  const basePrice = pricingTierPrice;
  const subtotal = basePrice + captainFee + cleaningFee;
  const serviceFee = calculateServiceFee(subtotal);
  const totalPrice = subtotal + serviceFee;

  return {
    basePrice,
    captainFee,
    cleaningFee,
    subtotal,
    serviceFee,
    totalPrice,
  };
};
