import { Suspense } from "react";
import { getInquiries } from "@/lib/actions/admin/inquiries";
import { InquiriesTable } from "@/components/admin/inquiries/InquiriesTable";
import { InquiriesTableSkeleton } from "@/components/admin/inquiries/InquiriesTableSkeleton";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams before using its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  // Parse and validate page number and limit
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = resolvedParams.limit ? Math.max(10, Math.min(100, parseInt(resolvedParams.limit))) : ITEMS_PER_PAGE;
  
  // Get filter parameters
  const search = resolvedParams.search;
  const status = resolvedParams.status;

  return (
    <div className="space-y-5">
      {/* Inquiries Table with Suspense for progressive loading */}
      <Suspense fallback={<InquiriesTableSkeleton />}>
        <InquiryTableWithData 
          page={currentPage}
          limit={limit}
          search={search}
          status={status}
        />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching to enable Suspense
async function InquiryTableWithData({
  page,
  limit,
  search,
  status
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const { inquiries, totalCount, totalPages } = await getInquiries({
    page,
    limit,
    status,
    search,
  });

  return (
    <>
      {/* Inquiries List */}
      <InquiriesTable inquiries={inquiries} />

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{ search, status }}
          baseUrl="/admin/inquiries"
          itemName="inquiries"
        />
      )}
    </>
  );
} 