"use client";

import { useQueryStates } from "nuqs";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { AdminListPagination } from "@/shared/admin/components/AdminListPagination";

interface AdminBookingTablePaginationProps {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function AdminBookingTablePagination(props: AdminBookingTablePaginationProps) {
  const [, setFilters] = useQueryStates(bookingSearchParams, {
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <AdminListPagination
      {...props}
      entityLabel="bookings"
      onPageChange={(page) => setFilters({ page })}
      onLimitChange={(limit) => setFilters({ limit, page: 1 })}
    />
  );
}
