import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/boats/search/SearchResults";
import VisGLSearchMap from "@/components/boats/search/map/VisGLSearchMap";
import SearchSkeleton from "@/components/boats/search/SearchSkeleton";
import MapToggleClient from "@/components/boats/search/MapToggleClient";
import { getBoats } from "@/lib/actions/boat-actions";
import { SearchResults as SearchResultsType } from "@/lib/types/types";
import { 
  normalizeSearchParams, 
  parseNumberParam, 
  parseBooleanParam,
  extractBoundingBox
} from "@/lib/utils/search-params-utils";

export const metadata: Metadata = {
  title: "Search Boats | KOSyachts",
  description: "Search for luxury yachts and boats available for charter.",
};

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

// Unified component for rendering both search results and map
function SearchPageContent({ 
  data,
  currentPage,
  isMapToggled,
  boundingBox
}: { 
  data: SearchResultsType,
  currentPage: number,
  isMapToggled: boolean,
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }
}) {
  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Search Results - Full width on mobile, left side on desktop */}
      <div className={`${isMapToggled ? 'hidden md:block' : 'block'} w-full md:w-2/3 overflow-y-auto h-full`}>
        <div className="p-4 sm:p-4 lg:p-6">
          <SearchResults 
            initialResults={data.boats}
            totalCount={data.totalCount}
            currentPage={currentPage}
            totalPages={data.totalPages}
            locations={data.locations}
          />
        </div>
      </div>
      
      {/* Map - Right side (1/3 width on desktop), fixed - only visible on desktop by default */}
      <div className="hidden md:block md:w-1/3 h-full">
        <div className="sticky top-0 h-full w-full bg-white">
          <VisGLSearchMap 
            locations={data.locations}
            boundingBox={boundingBox}
          />
        </div>
      </div>
    </div>
  );
}

// Update type signature for Next.js 15
type Props = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  // Await the promise to get the actual searchParams
  const resolvedSearchParams = await searchParams;
  
  // Normalize the search parameters using our utility function
  const normalizedParams = normalizeSearchParams(resolvedSearchParams);
  
  // Get current page (default to 1 if not provided)
  const currentPage = parseNumberParam(normalizedParams.page) || 1;
  
  // Check if map is toggled
  const isMapToggled = parseBooleanParam(normalizedParams.map_toggle);
  
  // Extract bounding box using our utility function
  const boundingBox = extractBoundingBox(normalizedParams);
  
  // Create a unique key for Suspense to ensure proper rerendering when search params change
  const searchParamsKey = Object.entries(normalizedParams)
    .filter(([key]) => key !== 'page' && key !== 'map_toggle') // Exclude page and map_toggle from the key
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // Single data fetch for all components
  const data = await getBoats({
    searchParams: normalizedParams,
    limit: 12,
    page: currentPage,
  });
  
  return (
    <main className="flex flex-col h-[calc(100vh-64px)]">
      {/* Map Toggle Client Component - Mobile */}
      <MapToggleClient 
        locations={data.locations}
        boundingBox={boundingBox}
      />

      {/* Unified search content with single data fetch */}
      <Suspense key={`search-${searchParamsKey}-page-${currentPage}`} fallback={<SearchSkeleton />}>
        <SearchPageContent 
          data={data}
          currentPage={currentPage}
          isMapToggled={isMapToggled}
          boundingBox={boundingBox}
        />
      </Suspense>
    </main>
  );
}
