"use client";

import { useQueryStates } from "nuqs";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { BookingFilters } from "./BookingFilters";

interface AdminBookingFilterProps {
  admins: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    username: string | null;
  }>;
}

/**
 * Admin booking filter - provides URL state to BookingFilters via useQueryStates.
 * Admins are passed from server to avoid client fetch.
 */
export function AdminBookingFilter({ admins }: AdminBookingFilterProps) {
  const [filters, setFilters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  return (
    <BookingFilters filters={filters} setFilters={setFilters} admins={admins} />
  );
}
