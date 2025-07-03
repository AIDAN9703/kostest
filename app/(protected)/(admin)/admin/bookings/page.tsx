import { Suspense } from "react";
import { getBookings } from "@/lib/actions/admin/bookings";
import { BookingsTable } from "@/components/admin/bookings/BookingsTable";
import { BookingsTableSkeleton } from "@/components/admin/bookings/BookingsTableSkeleton";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface SearchParams {
  page?: string;
  limit?: string;
}

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams before using its properties (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  // Parse and validate page number and limit
  const currentPage = resolvedParams.page ? Math.max(1, parseInt(resolvedParams.page)) : 1;
  const limit = resolvedParams.limit ? Math.max(10, Math.min(100, parseInt(resolvedParams.limit))) : ITEMS_PER_PAGE;

  return (
    <div className="space-y-5">
      {/* Bookings Table with Suspense for progressive loading */}
      <Suspense fallback={<BookingsTableSkeleton />}>
        <BookingTableWithData 
          page={currentPage}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}

// Separate component for bookings data fetching to enable Suspense
async function BookingTableWithData({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { bookings, totalCount, totalPages } = await getBookings({
    page,
    limit
  });

  return (
    <>
      {/* Bookings List */}
      <BookingsTable bookings={bookings} />

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{}}
          baseUrl="/admin/bookings"
          itemName="bookings"
        />
      )}
    </>
  );
} 