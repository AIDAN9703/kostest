import { Suspense } from "react";
import { bookingService } from "@/features/bookings/booking.service";
import { userService } from "@/features/users/user.service";
import { bookingSearchParamsCache } from "@/features/bookings/searchParams";
import { AdminBookingFilter } from "@/features/bookings/components/admin/AdminBookingFilter";
import { AdminBookingsTable } from "@/features/bookings/components/admin/AdminBookingsTable";
import { AdminBookingTablePagination } from "@/features/bookings/components/admin/AdminBookingTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await bookingSearchParamsCache.parse(searchParams);
  const params = bookingSearchParamsCache.all();

  const [result, admins] = await Promise.all([
    bookingService.getAllBookings({
      search: params.search || undefined,
      bookingStatus: params.bookingStatus ?? undefined,
      paymentStatus: params.paymentStatus ?? undefined,
      bookingType: params.bookingType ?? undefined,
      dateFrom: params.dateFrom ?? undefined,
      dateTo: params.dateTo ?? undefined,
      needsCaptain: params.needsCaptain ?? undefined,
      minAmount: params.minAmount ?? undefined,
      maxAmount: params.maxAmount ?? undefined,
      assignedAdminId: params.assignedAdminId ?? undefined,
      bookingGroupId: params.bookingGroupId ?? undefined,
      page: params.page,
      limit: params.limit,
    }),
    userService.getAdmins(),
  ]);

  return (
    <AdminTableWrapper>
      <Suspense fallback={<div className="h-14 border-b border-border animate-pulse" />}>
        <AdminBookingFilter admins={admins} />
      </Suspense>
      <AdminBookingsTable
        bookings={result.bookings}
        pagination={{
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
        admins={admins}
        hidePagination
      />
      <AdminBookingTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
