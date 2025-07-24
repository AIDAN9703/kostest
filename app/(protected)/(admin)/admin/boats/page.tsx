import { Suspense } from "react";
import { getAllBoats } from "@/features-admin/boats/actions/boats";
import { BoatsTable } from "@/features-admin/boats/components/BoatsTable";
import { BoatsPageSkeleton } from "@/features-admin/boats/components/BoatsPageSkeleton";
import { BoatsFilterBar } from "@/features-admin/boats/components/BoatsFilterBar";
import { DataTablePagination } from "@/features-admin/_layout/DataTablePagination";
import { boatFilterSchema, type BoatFilterInput } from "@/features-admin/_validation/boats";

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Parse searchParams using validation schema for type safety
  const rawParams = await searchParams;
  const filters: BoatFilterInput = boatFilterSchema.parse({
    page: rawParams.page,
    limit: rawParams.limit,
    search: rawParams.search,
    category: rawParams.category,
    featured: rawParams.featured,
    active: rawParams.active,
  });

  return (
    <div className="space-y-6">
      <Suspense fallback={<BoatsPageSkeleton />}>
        <BoatTableWithData filters={filters} />
      </Suspense>
    </div>
  );
}

// Server component for data fetching
async function BoatTableWithData({ filters }: { filters: BoatFilterInput }) {
  const { boats, totalCount, totalPages, page, limit } = await getAllBoats(filters);

  return (
    <>
      {/* Filter controls */}
      <BoatsFilterBar currentFilters={filters} />
      
      {/* Data table */}
      <BoatsTable boats={boats} />

      {/* Pagination when needed */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{
            search: filters.search,
            category: filters.category,
            featured: filters.featured ? 'true' : undefined,
            active: filters.active ? 'true' : undefined,
          }}
          baseUrl="/admin/boats"
          itemName="boats"
        />
      )}
    </>
  );
} 