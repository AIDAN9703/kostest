/**
 * Boats API Client
 * Handles data fetching via API routes for dropdowns and draft bookings
 */

import superjson from 'superjson';
import { type ApiResponse } from '@/shared/lib/types/api.types';
import type { BoatForAdminSelect } from '@/features/boats/boat.types';

export const boatsApi = {
  /**
   * Fetch boats for admin select (searchable combobox).
   * Calls: GET /api/admin/boats/list?search=...
   */
  async getBoatsForAdminSelect(search?: string): Promise<BoatForAdminSelect[]> {
    const params = new URLSearchParams();
    if (search && search.length >= 2) params.set('search', search);

    const url = `/api/admin/boats/list${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch boats: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = superjson.deserialize<ApiResponse<BoatForAdminSelect[]>>(json);

    if (!parsed.success || !parsed.data) {
      return [];
    }

    return parsed.data;
  },

  /**
   * Fetch single boat by ID (for displaying selected boat in BoatSelect)
   * Calls: GET /api/admin/boats/[id]
   */
  async getBoat(id: string): Promise<BoatForAdminSelect | null> {
    const response = await fetch(`/api/admin/boats/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch boat: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = superjson.deserialize<ApiResponse<BoatForAdminSelect>>(json);

    if (!parsed.success || !parsed.data) {
      return null;
    }

    return parsed.data;
  },

  /**
   * Fetch pricing tiers for a boat
   * Calls: GET /api/admin/boats/[id]/pricing-tiers
   */
  async getBoatPricingTiers(boatId: string): Promise<Array<{ id: string; hours: number; price: number; name: string | null; description: string | null; isActive: boolean; isDefault: boolean }>> {
    const response = await fetch(`/api/admin/boats/${boatId}/pricing-tiers`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing tiers: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = superjson.deserialize<ApiResponse<Array<{ id: string; hours: number; price: number; name: string | null; description: string | null; isActive: boolean; isDefault: boolean }>>>(json);
    
    if (!parsed.success || !parsed.data) {
      return [];
    }

    return parsed.data;
  },
};

