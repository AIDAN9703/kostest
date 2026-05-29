import { Suspense } from "react";
import { bookingService } from "@/features/bookings/services/booking.service";
import { userService } from "@/features/users/user.service";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { bookingSearchParamsCache } from "@/features/bookings/searchParams";
import { AdminBookingFilter } from "@/features/bookings/components/admin/AdminBookingFilter";
import { AdminBookingsTable } from "@/features/bookings/components/admin/AdminBookingsTable";
import { AdminBookingTablePagination } from "@/features/bookings/components/admin/AdminBookingTablePagination";
import { AdminBookingsCalendar } from "@/features/bookings/components/admin/AdminBookingsCalendar";
import { AdminListShell } from "@/shared/admin/components/AdminListShell";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await bookingSearchParamsCache.parse(searchParams);
  const params = bookingSearchParamsCache.all();

  const [admins, captains] = await Promise.all([
    userService.getAdmins(),
    captainProfileService.getCaptainsForAssignment(),
  ]);

  const filter = (
    <Suspense fallback={<div className="h-14 shrink-0 animate-pulse rounded-2xl bg-muted" />}>
      <AdminBookingFilter admins={admins} />
    </Suspense>
  );

  if (params.view === "calendar") {
    return (
      <AdminListShell toolbar={filter}>
        <AdminBookingsCalendar />
      </AdminListShell>
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
    <AdminListShell
      toolbar={filter}
      pagination={
        <AdminBookingTablePagination
          totalCount={result.totalCount}
          totalPages={result.totalPages}
          page={result.page}
          limit={result.limit}
        />
      }
    >
      <AdminBookingsTable
        bookings={result.bookings}
        admins={admins}
        captains={captains}
      />
    </AdminListShell>
  );
}
