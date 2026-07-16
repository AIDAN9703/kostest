import { auth } from "@/auth";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { inquirySearchParamsCache } from "@/features/inquiries/searchParams";
import { InquiriesToolbar } from "@/features/inquiries/components/InquiriesToolbar";
import { InquiriesList } from "@/features/inquiries/components/InquiriesList";
import { NewLeadDialog } from "@/features/inquiries/components/NewLeadDialog";
import { AdminInquiryTablePagination } from "@/features/inquiries/components/AdminInquiryTablePagination";
import { SearchParams } from "next/dist/server/request/search-params";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Admin access required</p>
        </div>
      </div>
    );
  }

  await inquirySearchParamsCache.parse(searchParams);
  const params = inquirySearchParamsCache.all();

  const result = await inquiryService.getAllInquiries({
    search: params.search || undefined,
    stage: params.stage ?? undefined,
    outcome: params.outcome ?? undefined,
    assignedToId: params.scope === "mine" ? session.user.id : undefined,
    unassignedOnly: params.scope === "unassigned",
    page: params.page,
    limit: params.limit,
  });

  return (
    <div className="flex w-full flex-1 flex-col pb-12">
      {/* ── Masthead ─────────────────────────────────────────── */}
      <header className="pb-5 pt-1">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Kings of the Sea · Lead Pipeline
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Inquiries</h1>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="font-mono text-3xl leading-none tabular-nums">
                {result.totalCount.toLocaleString()}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                On the books
              </p>
            </div>
            <NewLeadDialog />
          </div>
        </div>
      </header>

      {/* ── Toolbar (scope tabs on the ink rule, search below) ── */}
      <InquiriesToolbar />

      {/* ── Manifest ─────────────────────────────────────────── */}
      <div className="pt-2">
        <InquiriesList
          inquiries={result.inquiries}
          startIndex={(result.page - 1) * result.limit + 1}
        />
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      {result.totalPages > 1 ? (
        <div className="pt-5">
          <AdminInquiryTablePagination
            totalCount={result.totalCount}
            totalPages={result.totalPages}
            page={result.page}
            limit={result.limit}
          />
        </div>
      ) : null}
    </div>
  );
}
