import { Boat, PricingTier } from "../types/types";
import { formatCurrency } from "./general-utils";

/**
 * Gets the default or best pricing tier for a boat
 * Professional approach to handle pricing from a related table
 */
export function getDefaultPricingTier(boat: Boat): PricingTier | null {
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
 */
export function getBoatDefaultPrice(boat: Boat): number {
  // Try from pricing tiers first
  const defaultTier = getDefaultPricingTier(boat);
  if (defaultTier) return defaultTier.price;
  
  // Fallback to deprecated hourlyRate if it exists
  return boat.hourlyRate || 0;
}

/**
 * Gets the display hours for a boat's default pricing tier
 * This should only be used for showing a "starting from" duration
 */
export function getBoatDefaultHours(boat: Boat): string {
  const defaultTier = getDefaultPricingTier(boat);
  if (defaultTier) return `${defaultTier.hours}hr`;
  
  return "hr";
} 

/**
 * Compute the lowest price-per-hour across active tiers for "from $X+/hr" display
 */
export function getBoatStartingHourlyRate(boat: Boat): number {
  const activeTiers = boat.pricingTiers?.filter((tier) => tier.isActive) ?? [];
  if (activeTiers.length > 0) {
    const minPerHour = activeTiers.reduce((min, tier) => {
      const hours = Math.max(1, tier.hours || 0);
      const perHour = tier.price / hours;
      return perHour < min ? perHour : min;
    }, Infinity);
    return Number.isFinite(minPerHour) ? Math.max(0, Math.round(minPerHour)) : 0;
  }
  // Fallback to deprecated hourlyRate if provided
  if (typeof boat.hourlyRate === 'number') {
    return Math.max(0, boat.hourlyRate);
  }
  return 0;
}

/**
 * Convenience formatter for UI labels like "from $450+/hr"
 */
export function getBoatStartingHourlyLabel(boat: Boat): string {
  const hourly = getBoatStartingHourlyRate(boat);
  return `${formatCurrency(hourly)}+/hr`;
}