/**
 * Bookings API Client
 * Handles all data fetching via API routes
 */

import { type BookingFilterInput } from './booking.validation';
import { type PaginatedBookingsResponse, type BookingListItem } from './booking.types';
import { type ApiResponse, type PaginatedApiResponse } from '@/shared/types/api.types';

export const bookingsApi = {
  /**
   * Fetch bookings with filtering and pagination (Admin)
   * Calls: GET /api/admin/bookings
   */
  async getBookings(filters: BookingFilterInput = {}): Promise<PaginatedBookingsResponse> {
    // Build query string from all defined filters
    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );
    
    const response = await fetch(`/api/admin/bookings?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    const json: PaginatedApiResponse<BookingListItem> = await response.json();
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch bookings');
    }

    return {
      bookings: json.data,
      ...json.meta.pagination,
    };
  },

  /**
   * Fetch single booking by ID (Admin)
   * Calls: GET /api/admin/bookings/[id]
   */
  async getBooking(id: string): Promise<any> {
    const response = await fetch(`/api/admin/bookings/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.statusText}`);
    }

    const json: ApiResponse<any> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch booking');
    }

    return json.data;
  },

  /**
   * Delete a booking
   * Calls: DELETE /api/admin/bookings/[id]
   */
  async deleteBooking(id: string): Promise<void> {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete booking: ${response.statusText}`);
    }
  },
};

