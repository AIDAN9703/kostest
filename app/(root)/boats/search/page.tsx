import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/boats/search/SearchResults";
import VisGLSearchMap from "@/components/boats/search/map/VisGLSearchMap";
import SearchSkeleton from "@/components/boats/search/SearchSkeleton";
import MapToggleClient from "@/components/boats/search/MapToggleClient";
import { getBoats } from "@/lib/actions/boat-actions";
import { SearchParamsType } from "@/types/types";

export const metadata: Metadata = {
  title: "Search Boats | KOSyachts",
  description: "Search for luxury yachts and boats available for charter.",
};

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

// Helper function to normalize search params
async function normalizeSearchParams(params: Record<string, string | string[] | undefined>): Promise<SearchParamsType> {
  // Create a sanitized object that follows SearchParamsType
  const normalizedParams: SearchParamsType = {};
  
  // Copy values, filtering out undefined
  for(const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      normalizedParams[key as keyof SearchParamsType] = value;
    }
  }
  
  return normalizedParams;
}

// Unified component for data fetching and rendering both search results and map
async function SearchPageData({ 
  searchParams, 
  currentPage,
  isMapToggled 
}: { 
  searchParams: SearchParamsType, 
  currentPage: number,
  isMapToggled: boolean
}) {
  // Single data fetch for both map and results
  const data = await getBoats({
    searchParams,
    limit: 100, // Use larger limit to have enough data for both
    page: currentPage,
  });
  
  // Extract bounding box from search params if available
  const hasBoundingBox = 
    searchParams.ne_lat && 
    searchParams.ne_lng && 
    searchParams.sw_lat && 
    searchParams.sw_lng;
  
  const boundingBox = hasBoundingBox ? {
    ne: { 
      lat: parseFloat(searchParams.ne_lat as string), 
      lng: parseFloat(searchParams.ne_lng as string) 
    },
    sw: { 
      lat: parseFloat(searchParams.sw_lat as string), 
      lng: parseFloat(searchParams.sw_lng as string) 
    }
  } : undefined;
  
  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Search Results - Full width on mobile, left side on desktop */}
      <div className={`${isMapToggled ? 'hidden md:block' : 'block'} w-full md:w-2/3 overflow-y-auto h-full`}>
        <div className="p-4 sm:p-4 lg:p-6">
          <SearchResults 
            initialResults={data.boats.slice(0, 12)} // Only show first 12 boats in results
            totalCount={data.totalCount}
            currentPage={currentPage}
            totalPages={data.totalPages}
            locations={data.locations}
            initialFilters={searchParams}
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
  
  // Normalize the search parameters
  const normalizedParams = await normalizeSearchParams(resolvedSearchParams);
  
  // Get current page (default to 1 if not provided)
  const currentPage = Number(normalizedParams.page) || 1;
  
  // Check if map is toggled
  const isMapToggled = normalizedParams.map_toggle === 'on';
  
  // Create a unique key for Suspense to ensure proper rerendering when search params change
  const searchParamsKey = Object.entries(normalizedParams)
    .filter(([key]) => key !== 'page' && key !== 'map_toggle') // Exclude page and map_toggle from the key
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-white to-gray-50/50">
      {/* Map Toggle Client Component */}
      <MapToggleClient searchParams={normalizedParams} />

      {/* Unified search content with single data fetch */}
      <Suspense key={`search-${searchParamsKey}-page-${currentPage}`} fallback={<SearchSkeleton />}>
        <SearchPageData 
          searchParams={normalizedParams}
          currentPage={currentPage}
          isMapToggled={isMapToggled}
        />
      </Suspense>
    </main>
  );
}
