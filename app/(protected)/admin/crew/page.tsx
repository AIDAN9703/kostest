import { Suspense } from "react";
import { crewProfileService } from "@/features/profiles/crew-profile.service";
import { crewProfileListSearchParamsCache } from "@/features/profiles/crew-profile.search-params";
import { AdminCrewProfileFilter } from "@/features/profiles/components/AdminCrewProfileFilter";
import { AdminCrewProfileCards } from "@/features/profiles/components/AdminCrewProfileCards";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function AdminCrewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await crewProfileListSearchParamsCache.parse(searchParams);
  const params = crewProfileListSearchParamsCache.all();

  const rows = await crewProfileService.listForAdmin({
    search: params.search || undefined,
    status: params.status ?? undefined,
  });

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-9 max-w-md animate-pulse rounded-md bg-muted" />}>
        <AdminCrewProfileFilter />
      </Suspense>
      <AdminCrewProfileCards rows={rows} />
    </div>
  );
}
