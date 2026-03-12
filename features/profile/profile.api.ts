/**
 * Profile API Client
 * Handles profile-related data fetching via API routes
 */

import superjson from 'superjson';
import { type User } from '@/database/types';
import { type ApiResponse } from '@/shared/lib/types/api.types';

export interface ProfileStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
}

export const profileApi = {
  /**
   * Get current user profile
   * Calls: GET /api/users/profile
   */
  async getProfile(): Promise<User> {
    const response = await fetch('/api/users/profile');

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = superjson.deserialize<ApiResponse<User>>(json);

    if (!parsed.success || !parsed.data) {
      throw new Error(parsed.error || 'Failed to fetch profile');
    }

    return parsed.data;
  },

};
