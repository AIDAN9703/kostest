import { Suspense } from "react";
import { crewProfileService } from "@/features/profiles/crew-profile.service";
import { crewProfileListSearchParamsCache } from "@/features/profiles/crew-profile.search-params";
import { AdminCrewProfileFilter } from "@/features/profiles/components/AdminCrewProfileFilter";
import { AdminCrewProfilesTable } from "@/features/profiles/components/AdminCrewProfilesTable";
import { AdminCrewProfileTablePagination } from "@/features/profiles/components/AdminCrewProfileTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function AdminCrewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await crewProfileListSearchParamsCache.parse(searchParams);
  const params = crewProfileListSearchParamsCache.all();

  const result = await crewProfileService.listForAdmin({
    search: params.search || undefined,
    status: params.status ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <AdminTableWrapper>
      <Suspense fallback={<div className="h-14 animate-pulse border-b border-border" />}>
        <AdminCrewProfileFilter />
      </Suspense>
      <AdminCrewProfilesTable rows={result.rows} />
      <AdminCrewProfileTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
