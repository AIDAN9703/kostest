/**
 * Shared pricing math for the booking composer — one place for the tier
 * lookup (was copy-pasted across the old single/group/proposal forms).
 */

import type { PricingTierOption } from "../types";

export function groupTiersByBoat(
  pricingTiers: PricingTierOption[]
): Record<string, PricingTierOption[]> {
  return pricingTiers.reduce<Record<string, PricingTierOption[]>>((acc, tier) => {
    if (!acc[tier.boatId]) acc[tier.boatId] = [];
    acc[tier.boatId].push(tier);
    return acc;
  }, {});
}
