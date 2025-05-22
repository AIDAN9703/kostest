import { Suspense } from "react";
import Link from "next/link";
import { PlusSquare } from "lucide-react";
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
      {/* Page header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Boats</h1>
          <p className="text-sm text-gray-500">Manage your fleet of rental boats.</p>
        </div>
        <Link
          href="/admin/boats/create"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Add New Boat
        </Link>
      </div>

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