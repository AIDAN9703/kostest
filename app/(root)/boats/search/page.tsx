import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/boats/search/SearchResults";
import SearchFilters from "@/components/boats/search/SearchFilters";
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
async function normalizeSearchParams(params: Record<string, string | string[]>): Promise<SearchParamsType> {
  // Create a plain object without any symbol properties
  const plainParams: Record<string, string | string[]> = {};
  
  // Only copy over string and string[] properties
  for(const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || Array.isArray(value)) {
      plainParams[key] = value;
    }
  }
  
  return plainParams as SearchParamsType;
}

// Separate component for loading the search results with Suspense boundary
async function SearchResultsWithData({ 
  searchParams, 
  currentPage 
}: { 
  searchParams: SearchParamsType, 
  currentPage: number 
}) {
  const initialResults = await getBoats({
    searchParams,
    limit: 12,
    page: currentPage,
  });
  
  return (
    <SearchResults 
      initialResults={initialResults.boats} 
      totalCount={initialResults.totalCount}
      currentPage={currentPage}
      totalPages={initialResults.totalPages}
      locations={initialResults.locations}
    />
  );
}

// Separate component for loading the map with Suspense boundary
async function SearchMapWrapper({ searchParams }: { searchParams: SearchParamsType }) {
  try {
    const mapData = await getBoats({
      searchParams,
      limit: 100, // Get more locations for the map
      page: 1,
    });
    
    // Ensure we have at least some data for testing
    let locations = [...mapData.locations];
    
    if (locations.length === 0) {
      console.log("No locations found, adding fallback locations");
    }
    
    return <VisGLSearchMap locations={locations} />;
  } catch (error) {
    console.error("Error loading map data:", error);
    // Return map with fallback location on error
    return <VisGLSearchMap locations={[{
      id: "error-fallback",
      name: "Default Location",
      latitude: 25.7617,
      longitude: -80.1918,
      category: "YACHT",
      price: 500
    }]} />;
  }
}

// Server component wrapper for the map
function ServerMapComponent({ searchParams }: { searchParams: SearchParamsType }) {
  return (
    <Suspense fallback={<div className="h-full w-full bg-gray-100 animate-pulse" />}>
      <SearchMapWrapper searchParams={searchParams} />
    </Suspense>
  );
}

// Update type signature
type Props = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage(props: Props) {
  try {
    // Await both params and searchParams
    const params = await props.params;
    
    // Create a safer copy of searchParams to avoid the Next.js warning
    const filteredParams: Record<string, string | string[]> = {};
    
    // Await the searchParams before accessing its properties
    const searchParamsObj = await props.searchParams;
    
    // Now we can safely access properties
    for (const [key, value] of Object.entries(searchParamsObj)) {
      if (value !== undefined) {
        filteredParams[key] = value;
      }
    }
    
    // Normalize the filtered params
    const normalizedParams = await normalizeSearchParams(filteredParams);
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
        {/* Search Header - Sticky at the top */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg w-full border-b border-gray-100">
          <div className="w-full">
            <SearchFilters initialFilters={normalizedParams} />
          </div>
        </div>

        {/* Map Toggle Client Component */}
        <MapToggleClient searchParams={normalizedParams} />

        {/* Main Content - Flexbox for the split layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Search Results - Full width on mobile, left side on desktop */}
          <div className={`${isMapToggled ? 'hidden md:block' : 'block'} w-full md:w-2/3 overflow-y-auto`}>
            <div className="p-4 sm:p-4 lg:p-6">
              <Suspense key={`${searchParamsKey}-page-${currentPage}`} fallback={<SearchSkeleton />}>
                <SearchResultsWithData 
                  searchParams={normalizedParams}
                  currentPage={currentPage}
                />
              </Suspense>
            </div>
          </div>
          
          {/* Map - Right side (1/3 width on desktop), fixed - only visible on desktop by default */}
          <div className="hidden md:block md:w-1/3">
            <div className="sticky top-0 h-[calc(100vh-var(--search-filter-height))] w-full bg-white">
              <ServerMapComponent searchParams={normalizedParams} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error in SearchPage:", error);
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We encountered an error while loading the search results. Please try again later.</p>
          <button 
            onClick={() => window.location.href = '/boats/search'}
            className="px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2C3E50] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </main>
    );
  }
}
