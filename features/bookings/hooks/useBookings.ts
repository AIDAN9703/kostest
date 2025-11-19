import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../booking.api";
import { type BookingFilterInput } from "../booking.validation";

/**
 * Fetch paginated and filtered bookings list
 */
export function useBookings(filters: BookingFilterInput = {}) {
  return useQuery({
    queryKey: ['bookings', 'list', filters],
    queryFn: () => bookingsApi.getBookings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - bookings change frequently
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single booking by ID
 */
export function useBooking(
  id: string,
  options?: {
    initialData?: any;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => bookingsApi.getBooking(id),
    enabled: !!id,
    initialData: options?.initialData,
    staleTime: options?.staleTime ?? 2 * 60 * 1000,
  });
}

