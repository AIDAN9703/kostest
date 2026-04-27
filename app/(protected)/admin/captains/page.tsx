import { Suspense } from "react";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { captainProfileListSearchParamsCache } from "@/features/profiles/captain-profile.search-params";
import { AdminCaptainProfileFilter } from "@/features/profiles/components/AdminCaptainProfileFilter";
import { AdminCaptainProfilesTable } from "@/features/profiles/components/AdminCaptainProfilesTable";
import { AdminCaptainProfileTablePagination } from "@/features/profiles/components/AdminCaptainProfileTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function AdminCaptainsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await captainProfileListSearchParamsCache.parse(searchParams);
  const params = captainProfileListSearchParamsCache.all();

  const result = await captainProfileService.listForAdmin({
    search: params.search || undefined,
    status: params.status ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <AdminTableWrapper>
      <Suspense fallback={<div className="h-14 animate-pulse border-b border-border" />}>
        <AdminCaptainProfileFilter />
      </Suspense>
      <AdminCaptainProfilesTable rows={result.rows} />
      <AdminCaptainProfileTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
