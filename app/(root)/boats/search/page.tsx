import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/components/boats/search/SearchResults";
import SearchFilters from "@/components/boats/search/SearchFilters";
import VisGLSearchMap from "@/components/boats/search/VisGLSearchMap";
import SearchSkeleton from "@/components/boats/search/SearchSkeleton";
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
    
    // Log map data for debugging
    console.log(`Map data fetched: ${mapData.locations.length} locations`);
    
    // Ensure we have at least some data for testing
    let locations = [...mapData.locations];
    
    if (locations.length === 0) {
      console.log("No locations found, adding fallback locations");
      // Add fallback locations for testing
      locations = [
        {
          id: "fallback-1",
          name: "Miami Yacht",
          latitude: 25.7617,
          longitude: -80.1918,
          category: "YACHT",
          price: 500
        },
        {
          id: "fallback-2",
          name: "Fort Lauderdale Boat",
          latitude: 26.1224,
          longitude: -80.1373,
          category: "SPEEDBOAT",
          price: 300
        }
      ];
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

// Update the type definition to match Next.js 15's expected PageProps interface
type Params = Promise<Record<string, string>>;
type SearchParams = Promise<Record<string, string | string[]>>;

export default async function SearchPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  try {
    // Await the params and searchParams as they are now Promises in Next.js 15
    const params = await props.params;
    const searchParams = await props.searchParams;
    
    // Convert searchParams to a plain object to avoid the symbol properties error
    const normalizedParams = await normalizeSearchParams(searchParams);
    const currentPage = Number(normalizedParams.page) || 1;
    
    // Create a unique key for Suspense to ensure proper rerendering when search params change
    const searchParamsKey = Object.entries(normalizedParams)
      .filter(([key]) => key !== 'page') // Exclude page from the key to avoid unnecessary rerenders
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
        {/* Search Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <SearchFilters initialFilters={normalizedParams} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search Results */}
            <div className="lg:col-span-8 xl:col-span-9">
              <Suspense key={`${searchParamsKey}-page-${currentPage}`} fallback={<SearchSkeleton />}>
                <SearchResultsWithData 
                  searchParams={normalizedParams}
                  currentPage={currentPage}
                />
              </Suspense>
            </div>
            
            {/* Map */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-[120px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl bg-white h-[calc(100vh-200px)] min-h-[600px]">
                <Suspense key={searchParamsKey} fallback={<div className="h-full w-full bg-gray-100 animate-pulse" />}>
                  <SearchMapWrapper searchParams={normalizedParams} />
                </Suspense>
              </div>
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
