import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/boats/search/SearchResults";
import VisGLSearchMap from "@/components/boats/search/map/VisGLSearchMap";
import SearchSkeleton from "@/components/boats/search/SearchSkeleton";
import { getBoats } from "@/lib/actions/boat-actions";
import { SearchResults as SearchResultsType } from "@/lib/types/types";
import { 
  normalizeSearchParams,
  parseNumberParam, 
  extractBoundingBox
} from "@/lib/utils/search-params-utils";

export const metadata: Metadata = {
  title: "Search Boats | KOSyachts",
  description: "Search for luxury yachts and boats available for charter.",
};

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

// Clean search page layout component
function SearchPageContent({ 
  data,
  currentPage,
  boundingBox
}: { 
  data: SearchResultsType,
  currentPage: number,
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }
}) {
  return (
    <div className="flex min-h-screen">
      {/* Search Results - Full width on mobile, 2/3 width on desktop */}
      <div className="w-full md:w-2/3">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <SearchResults 
            initialResults={data.boats}
            totalCount={data.totalCount}
            currentPage={currentPage}
            totalPages={data.totalPages}
            locations={data.locations}
          />
        </div>
      </div>
      
      {/* Map - Right side (1/3 width) - DESKTOP ONLY */}
      <div className="hidden md:flex md:w-1/3">
        <div className="sticky top-[80px] h-[calc(100vh-80px)] w-full">
          <VisGLSearchMap 
            locations={data.locations}
            boundingBox={boundingBox}
          />
        </div>
      </div>
    </div>
  );
}

// Simplified type signature for Next.js 15
type Props = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  // Await the promise to get the actual searchParams
  const resolvedSearchParams = await searchParams;
  
  // Normalize the search parameters using our utility function
  const normalizedParams = normalizeSearchParams(resolvedSearchParams);
  
  // Get current page (default to 1)
  const currentPage = parseNumberParam(normalizedParams.page) || 1;
  
  // Extract bounding box for desktop map
  const boundingBox = extractBoundingBox(normalizedParams);
  
  // Single data fetch for all components
  const data = await getBoats({
    searchParams: normalizedParams,
    limit: 12,
    page: currentPage,
  });
  
  return (
    <main>
      {/* Unified search content - Stable key to prevent map remounting */}
      <Suspense key="boat-search-results" fallback={<SearchSkeleton />}>
        <SearchPageContent 
          data={data}
          currentPage={currentPage}
          boundingBox={boundingBox}
        />
      </Suspense>
    </main>
  );
}
