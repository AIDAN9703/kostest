import { Boat, PricingTier } from "../types/types";
import { formatCurrency as formatCurrencyFn } from "./general-utils";

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
 * Gets the default price for a boat
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
 */
export function getBoatDefaultHours(boat: Boat): string {
  const defaultTier = getDefaultPricingTier(boat);
  if (defaultTier) return `${defaultTier.hours}hr`;
  
  return "hr";
}

/**
 * Format boat price for display with proper hour unit
 */
export function formatBoatPrice(boat: Boat, formatCurrency = formatCurrencyFn): string {
  const price = getBoatDefaultPrice(boat);
  const hours = getBoatDefaultHours(boat);
  return `${formatCurrency(price)}/${hours}`;
}

/**
 * Calculate the price for a specific duration from pricing tiers
 */
export function calculatePriceFromTiers(
  pricingTiers: PricingTier[] | undefined, 
  hours: number
): number {
  if (!pricingTiers || pricingTiers.length === 0) return 0;
  
  // Find an exact match for the number of hours
  const exactTier = pricingTiers.find(tier => tier.hours === hours && tier.isActive);
  if (exactTier) return exactTier.price;
  
  // If no exact match, find the closest tier (prefer higher tier)
  const sortedTiers = [...pricingTiers]
    .filter(tier => tier.isActive)
    .sort((a, b) => a.hours - b.hours);
  
  // Find the closest tier that covers the requested hours
  const closestTier = sortedTiers.find(tier => tier.hours >= hours);
  if (closestTier) return closestTier.price;
  
  // If no higher tier is found, use the highest available tier
  return sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].price : 0;
} 