import { Suspense } from "react";
import { boatService } from "@/features/boats/boat.service";
import { boatSearchParamsCache } from "@/features/boats/searchParams";
import { AdminBoatFilter } from "@/features/boats/components/AdminBoatFilter";
import { AdminBoatsTable } from "@/features/boats/components/AdminBoatsTable";
import { AdminBoatTablePagination } from "@/features/boats/components/AdminBoatTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await boatSearchParamsCache.parse(searchParams);
  const params = boatSearchParamsCache.all();

  const result = await boatService.getAllBoats({
    search: params.search || undefined,
    category: params.category ?? undefined,
    featured: params.featured ?? undefined,
    active: params.active ?? undefined,
    minPrice: params.minPrice ?? undefined,
    maxPrice: params.maxPrice ?? undefined,
    minLength: params.minLength ?? undefined,
    maxLength: params.maxLength ?? undefined,
    minCapacity: params.minCapacity ?? undefined,
    maxCapacity: params.maxCapacity ?? undefined,
    minYear: params.minYear ?? undefined,
    maxYear: params.maxYear ?? undefined,
    minSleeps: params.minSleeps ?? undefined,
    minBathrooms: params.minBathrooms ?? undefined,
    locationLabel: params.locationLabel ?? undefined,
    crewRequired: params.crewRequired ?? undefined,
    instantBook: params.instantBook ?? undefined,
    dayCharter: params.dayCharter ?? undefined,
    termCharter: params.termCharter ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <AdminTableWrapper>
      <Suspense fallback={<div className="h-14 border-b border-border animate-pulse" />}>
        <AdminBoatFilter />
      </Suspense>
      <AdminBoatsTable
        boats={result.boats}
        pagination={{
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
      />
      <AdminBoatTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
