import { Suspense } from "react";
import { bookingService } from "@/features/bookings/services/booking.service";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { bookingSearchParamsCache } from "@/features/bookings/searchParams";
import { AdminBookingFilter } from "@/features/bookings/components/admin/AdminBookingFilter";
import { AdminBookingsTable } from "@/features/bookings/components/admin/AdminBookingsTable";
import { AdminBookingTablePagination } from "@/features/bookings/components/admin/AdminBookingTablePagination";
import { AdminBookingsCalendar } from "@/features/bookings/components/admin/AdminBookingsCalendar";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await bookingSearchParamsCache.parse(searchParams);
  const params = bookingSearchParamsCache.all();

  // Fetch the small lookup lists once for the page — used by the filter (admins
  // dropdown) and the prototype "New booking" wizard (boats, captains, admins).
  const [admins, boats, captains] = await Promise.all([
    userService.getAdmins(),
    boatService.getBoatsForAdminSelect(),
    captainProfileService.getCaptainsForAssignment(),
  ]);

  // Calendar view skips the paginated server fetch — the FullCalendar component
  // pulls its own events via /api/admin/bookings/calendar-events for the visible window.
  if (params.view === "calendar") {
    return (
      <AdminTableWrapper>
        <Suspense fallback={<div className="h-14 border-b border-border animate-pulse" />}>
          <AdminBookingFilter admins={admins} boats={boats} captains={captains} />
        </Suspense>
        <AdminBookingsCalendar />
      </AdminTableWrapper>
    );
  }

  const result = await bookingService.getAllBookings({
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
  });

  return (
    <AdminTableWrapper>
      <Suspense fallback={<div className="h-14 border-b border-border animate-pulse" />}>
        <AdminBookingFilter admins={admins} boats={boats} captains={captains} />
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
        showOps={params.showOps}
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
