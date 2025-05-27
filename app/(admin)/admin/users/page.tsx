import { Suspense } from "react";
import { getAllUsers } from "@/lib/actions/admin/users";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UsersTableSkeleton } from "@/components/admin/users/UsersTableSkeleton";
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

export default async function UsersPage({
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
      {/* Users Table with Suspense for progressive loading */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UserTableWithData 
          page={currentPage}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching to enable Suspense
async function UserTableWithData({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { users, totalCount, totalPages } = await getAllUsers({
    page,
    limit
  });

  return (
    <>
      {/* Users List */}
      <UsersTable users={users} />

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{}}
          baseUrl="/admin/users"
          itemName="users"
        />
      )}
    </>
  );
} 