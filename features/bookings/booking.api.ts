/**
 * Bookings API Client
 * Handles all data fetching via API routes
 */

import superjson from 'superjson';
import { type BookingFilterInput } from './booking.validation';
import { type BookingListItem, type BookingDetails } from './booking.types';
import { type ApiResponse, type PaginatedApiResponse } from '@/shared/lib/types/api.types';

export const bookingsApi = {
  /**
   * Fetch bookings with filtering and pagination (Admin)
   * Calls: GET /api/admin/bookings
   */
  async getBookings(filters: BookingFilterInput = {}): Promise<PaginatedApiResponse<BookingListItem>> {
    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
    
    const response = await fetch(`/api/admin/bookings?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    const json = await response.json();
    return superjson.deserialize(json);
  },

  /**
   * Fetch single booking by ID (Admin)
   * Calls: GET /api/admin/bookings/[id]
   */
  async getBooking(id: string): Promise<BookingDetails> {
    const response = await fetch(`/api/admin/bookings/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = superjson.deserialize<ApiResponse<BookingDetails>>(json);
    
    if (!parsed.success || !parsed.data) {
      throw new Error(parsed.error || 'Failed to fetch booking');
    }

    return parsed.data;
  },
};

