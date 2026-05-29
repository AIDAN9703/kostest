import { Suspense } from "react";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { captainProfileListSearchParamsCache } from "@/features/profiles/captain-profile.search-params";
import { AdminCaptainProfileFilter } from "@/features/profiles/components/AdminCaptainProfileFilter";
import { AdminCaptainProfileCards } from "@/features/profiles/components/AdminCaptainProfileCards";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function AdminCaptainsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await captainProfileListSearchParamsCache.parse(searchParams);
  const params = captainProfileListSearchParamsCache.all();

  const rows = await captainProfileService.listForAdmin({
    search: params.search || undefined,
    status: params.status ?? undefined,
  });

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-9 max-w-md animate-pulse rounded-md bg-muted" />}>
        <AdminCaptainProfileFilter />
      </Suspense>
      <AdminCaptainProfileCards rows={rows} />
    </div>
  );
}
