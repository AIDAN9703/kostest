import { auth } from "@/auth";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { inquirySearchParamsCache } from "@/features/inquiries/searchParams";
import { InquiryFilterPills } from "@/features/inquiries/components/InquiryFilterPills";
import { InquiriesList } from "@/features/inquiries/components/InquiriesList";
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
    stage: params.stage ?? undefined,
    outcome: params.outcome ?? undefined,
    page: params.page,
    limit: params.limit,
  });

  return (
    <div className="flex w-full flex-1 flex-col pb-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5 pt-1">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Inquiries</h1>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {result.totalCount.toLocaleString()}{" "}
            {result.totalCount === 1 ? "inquiry" : "inquiries"}
            {params.stage || params.outcome ? " match these filters" : " total"}
          </p>
        </div>
        <InquiryFilterPills />
      </header>

      {/* List */}
      <div className="pt-3">
        <InquiriesList inquiries={result.inquiries} />
      </div>

      {/* Pagination */}
      {result.totalPages > 1 ? (
        <div className="mt-auto border-t border-border/40 pt-4">
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
