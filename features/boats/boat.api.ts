/**
 * Boats API Client
 * Handles all data fetching via API routes
 */

import { type Boat } from '@/database/types';
import { type BoatFilterInput } from '@/features/boats/boat.validation';
import { type PaginatedBoatsResponse, type BoatWithTiers } from '@/features/boats/boat.types';
import { type ApiResponse, type PaginatedApiResponse } from '@/shared/types/api.types';

export const boatsApi = {
  // ========================================
  // ADMIN API FUNCTIONS
  // ========================================

  /**
   * Fetch boats with filtering and pagination (Admin)
   * Calls: GET /api/admin/boats
   */
  async getBoats(filters: BoatFilterInput = {}): Promise<PaginatedBoatsResponse> {
    // Build query string from all defined filters
    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
    
    const response = await fetch(`/api/admin/boats?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch boats: ${response.statusText}`);
    }

    const json: PaginatedApiResponse<any> = await response.json();
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch boats');
    }

    return {
      boats: json.data,
      ...json.meta.pagination,
    };
  },

  /**
   * Fetch single boat by ID (Admin)
   * Calls: GET /api/admin/boats/[id]
   */
  async getBoat(id: string): Promise<BoatWithTiers> {
    const response = await fetch(`/api/admin/boats/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch boat: ${response.statusText}`);
    }

    const json: ApiResponse<BoatWithTiers> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch boat');
    }

    return json.data;
  },

  // ========================================
  // PUBLIC API FUNCTIONS (Future)
  // ========================================

  /**
   * Fetch featured boats for public display
   * Calls: GET /api/boats/featured
   */
  async getFeaturedBoats(): Promise<Boat[]> {
    const response = await fetch('/api/boats/featured');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured boats: ${response.statusText}`);
    }

    const json: ApiResponse<Boat[]> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch featured boats');
    }

    return json.data;
  },

  /**
   * Fetch boat by ID for public view
   * Calls: GET /api/boats/[id]
   */
  async getPublicBoat(id: string): Promise<BoatWithTiers> {
    const response = await fetch(`/api/boats/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch boat: ${response.statusText}`);
    }

    const json: ApiResponse<BoatWithTiers> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch boat');
    }

    return json.data;
  },
};

