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
  
  // Look for default pricing tier first
  const defaultTier = boat.pricingTiers.find(tier => tier.isDefault && tier.isActive);
  if (defaultTier) return defaultTier;
  
  // Otherwise use the first active tier
  const firstActiveTier = boat.pricingTiers.find(tier => tier.isActive);
  if (firstActiveTier) return firstActiveTier;
  
  // Last resort - just use the first tier regardless of active status
  return boat.pricingTiers[0];
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