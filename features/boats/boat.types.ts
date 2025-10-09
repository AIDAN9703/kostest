/**
 * Application-level types for boats
 * These extend or derive from the base database types
 */

import { type Boat, type BoatPricingTier } from '@/database/types';

/**
 * Boat list item - optimized for table display
 */
export type BoatListItem = Pick<
  Boat,
  | 'id'
  | 'name'
  | 'category'
  | 'capacity'
  | 'lengthFt'
  | 'active'
  | 'featured'
  | 'mainImage'
  | 'createdAt'
  | 'ownerId'
> & {
  ownerName?: string | null;
  basePrice?: number | null;
};

/**
 * Paginated boats response
 */
export interface PaginatedBoatsResponse {
  boats: BoatListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Boat with full details including pricing tiers
 */
export interface BoatWithTiers extends Boat {
  pricingTiers: BoatPricingTier[];
  locationCoordinates?: {
    lat: number;
    lng: number;
  } | null;
  ownerFirstName?: string | null;
  ownerLastName?: string | null;
  ownerEmail?: string | null;
  ownerDisplayName?: string | null;
}

/**
 * Pricing tier type - re-export from database types
 */
export type PricingTier = BoatPricingTier;

/**
 * Public boat view - safe for frontend display
 */
export type PublicBoat = Omit<
  Boat,
  | 'ownerNotes'
  | 'insuranceInfo'
  | 'insuranceExpiry'
  | 'maintenanceNotes'
  | 'lastMaintenanceDate'
  | 'nextMaintenanceDate'
>;
