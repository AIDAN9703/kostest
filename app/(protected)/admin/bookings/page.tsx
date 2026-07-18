import { Suspense } from "react";
import { auth } from "@/auth";
import { getMasterDeals } from "@/features/bookings/services/master-deals.service";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { bookingSearchParamsCache } from "@/features/bookings/searchParams";
import { AdminBookingFilter } from "@/features/bookings/components/admin/AdminBookingFilter";
import { BookingsHeaderCta } from "@/features/bookings/components/admin/BookingsHeaderCta";
import { NewLeadDialog } from "@/features/inquiries/components/NewLeadDialog";
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

  const [admins, captains, pricingTiers] = await Promise.all([
    userService.getAdmins(),
    captainProfileService.getCaptainsForAssignment(),
    boatService.getAllActivePricingTiers(),
  ]);

  const filter = (
    <Suspense fallback={<div className="h-10 shrink-0 animate-pulse rounded-full bg-muted pb-3" />}>
      <AdminBookingFilter admins={admins} />
    </Suspense>
  );

  // Manual intake lives here now too: "Log lead" for phone/Instagram/broker
  // inquiries, "Add booking" for real bookings — one tab for everything.
  const headerCta = (
    <div className="flex flex-wrap items-center gap-2">
      <NewLeadDialog />
      <BookingsHeaderCta pricingTiers={pricingTiers} />
    </div>
  );

  if (params.view === "calendar") {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        <BookingsPageHeader cta={headerCta} />
        <div className="flex min-h-0 flex-1 flex-col">
          <AdminListShell toolbar={filter}>
            <AdminBookingsCalendar />
          </AdminListShell>
        </div>
      </div>
    );
  }

  const session = await auth();
  const nowIso = new Date().toISOString();

  // The master list: bookings AND unconverted leads, one view, one vocabulary.
  const result = await getMasterDeals({
    search: params.search || undefined,
    // Explicit date-range filters win over the Upcoming/Past pills.
    dateFrom: params.dateFrom ?? (params.time === "upcoming" ? nowIso : undefined),
    dateTo: params.dateTo ?? (params.time === "past" ? nowIso : undefined),
    assignedToId: params.scope === "mine" ? (session?.user?.id ?? undefined) : undefined,
    unassignedOnly: params.scope === "unassigned" || undefined,
    archived: params.archived ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <BookingsPageHeader totalCount={result.totalCount} cta={headerCta} />
      <div className="flex min-h-0 flex-1 flex-col">
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
          <AdminBookingsTable rows={result.rows} admins={admins} captains={captains} />
        </AdminListShell>
      </div>
    </div>
  );
}

function BookingsPageHeader({
  totalCount,
  cta,
}: {
  totalCount?: number;
  cta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pb-4 pt-1">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        {totalCount != null ? (
          <p className="text-sm tabular-nums text-muted-foreground">
            {totalCount.toLocaleString()} {totalCount === 1 ? "booking" : "bookings"}
          </p>
        ) : null}
      </div>
      {cta}
    </header>
  );
}
