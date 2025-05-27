import { Suspense } from "react";
import { getAllBoats } from "@/lib/actions/admin/boats";
import { BoatsTable } from "@/components/admin/boats/BoatsTable";
import { BoatsTableSkeleton } from "@/components/admin/boats/BoatsTableSkeleton";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { boatCategoryEnum } from "@/database/schema";

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  featured?: string;
  active?: string;
}

// This enables automatic revalidation every 30 seconds
export const revalidate = 30;

export default async function BoatsPage({
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
  const category = resolvedParams.category as typeof boatCategoryEnum.enumValues[number] | undefined;
  const featured = resolvedParams.featured === 'true';
  const active = resolvedParams.active === 'true';

  return (
    <div className="space-y-5">
      {/* Boats Table with Suspense for progressive loading */}
      <Suspense fallback={<BoatsTableSkeleton />}>
        <BoatTableWithData 
          page={currentPage}
          limit={limit}
          search={search}
          category={category}
          featured={featured ? true : undefined}
          active={active ? true : undefined}
        />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching to enable Suspense
async function BoatTableWithData({
  page,
  limit,
  search,
  category,
  featured,
  active
}: {
  page: number;
  limit: number;
  search?: string;
  category?: typeof boatCategoryEnum.enumValues[number];
  featured?: boolean;
  active?: boolean;
}) {
  const { boats, totalCount, totalPages } = await getAllBoats({
    page,
    limit,
    search,
    category,
    featured,
    active
  });

  // Transform boats to match the expected type in BoatsTable
  const transformedBoats = boats.map(boat => ({
    ...boat,
    featured: boat.featured ?? false,
    active: boat.active ?? false
  }));

  return (
    <>
      {/* Boats List */}
      <BoatsTable boats={transformedBoats} />

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={limit}
          searchParams={{ search, category, featured: featured ? 'true' : undefined, active: active ? 'true' : undefined }}
          baseUrl="/admin/boats"
          itemName="boats"
        />
      )}
    </>
  );
} 