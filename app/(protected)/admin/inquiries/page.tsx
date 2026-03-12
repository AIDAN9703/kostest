import { Suspense } from "react";
import { auth } from "@/auth";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { inquirySearchParamsCache } from "@/features/inquiries/searchParams";
import { AdminInquiryFilter } from "@/features/inquiries/components/AdminInquiryFilter";
import { AdminInquiriesTable } from "@/features/inquiries/components/AdminInquiriesTable";
import { AdminInquiryTablePagination } from "@/features/inquiries/components/AdminInquiryTablePagination";
import { AdminTableWrapper } from "@/shared/admin/components/AdminTableWrapper";
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
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
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
    <AdminTableWrapper>
      <Suspense
        fallback={<div className="h-14 border-b border-border animate-pulse" />}
      >
        <AdminInquiryFilter />
      </Suspense>
      <AdminInquiriesTable
        inquiries={result.inquiries}
        pagination={{
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        }}
      />
      <AdminInquiryTablePagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        page={result.page}
        limit={result.limit}
      />
    </AdminTableWrapper>
  );
}
