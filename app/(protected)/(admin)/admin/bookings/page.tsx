"use client";

// Components
import { BookingFilters } from "@/features/bookings/components/BookingFilters";
import { AdminBookingsTable } from "@/features/bookings/components/AdminBookingsTable";
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";

// Hooks
import { useBookings } from "@/features/bookings/hooks/useBookings";
import { useDeleteBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { type BookingFilterInput } from "@/features/bookings/booking.validation";

//-----------------------------------------------------------------------------------

export default function BookingsPage() {
  // URL-based filters with nuqs - single source of truth for all filters
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      bookingStatus: parseAsString,
      paymentStatus: parseAsString,
      bookingType: parseAsString,
      dateFrom: parseAsString,
      dateTo: parseAsString,
      needsCaptain: parseAsBoolean,
      minAmount: parseAsInteger,
      maxAmount: parseAsInteger,
      page: parseAsInteger.withDefault(1),
    },
    {
      // Automatically removes params from URL when set to null
      clearOnDefault: true,
    }
  );

  // Build clean API filters - convert null to undefined for type safety
  const apiFilters: BookingFilterInput = Object.fromEntries(
    Object.entries({ ...filters, limit: 10 }).map(([key, value]) => [
      key,
      value ?? undefined,
    ])
  ) as BookingFilterInput;

  const { data, isLoading, error } = useBookings(apiFilters);
  const deleteBooking = useDeleteBooking();
  const queryClient = useQueryClient();

  const handleDelete = (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    )
      return;
    deleteBooking.mutate(bookingId);
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleRefresh = () => {
    // Invalidate and refetch bookings
    queryClient.invalidateQueries({ queryKey: ["bookings", "list"] });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Failed to load bookings. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-xs border border-gray-200/70">
      {/* Filters */}
      <BookingFilters filters={filters} setFilters={setFilters} />

      {/* Table */}
      <AdminBookingsTable
        bookings={data?.data || []}
        pagination={{
          page: data?.meta?.pagination?.page || 1,
          limit: data?.meta?.pagination?.limit || 10,
          totalCount: data?.meta?.pagination?.totalCount || 0,
          totalPages: data?.meta?.pagination?.totalPages || 0,
        }}
        loading={isLoading}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
