import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "@/features/search/components/SearchResults";
import VisGLSearchMap from "@/features/search/components/map/VisGLSearchMap";
import SearchSkeleton from "@/features/search/components/SearchSkeleton";
import { searchBoats } from "@/features/search/actions/search-actions";
import { SearchResults as SearchResultsType } from "@/shared/lib/types/types";
import {
  normalizeSearchParams,
  parseNumberParam,
  extractBoundingBox,
} from "@/shared/lib/utils/search-params-utils";

export const metadata: Metadata = {
  title: "Search Boats | KOSyachts",
  description: "Search for luxury yachts and boats available for charter.",
  alternates: {
    canonical: "https://www.kosyachts.com/boats/search",
  },
};

// ISR configuration for search page
// Shorter revalidation since search results change more frequently
export const revalidate = 1800; // 30 minutes

// Generate static params for common search patterns at build time
export async function generateStaticParams() {
  // Pre-generate common search combinations
  const commonSearches = [
    {}, // Default search (no filters)
    { category: "yacht" },
    { category: "sportfish" },
    { category: "sailboat" },
    // Add more common search patterns based on your analytics
  ];

  return commonSearches.map((searchParams) => searchParams);
}

// Clean search page layout component
function SearchPageContent({
  data,
  currentPage,
  boundingBox,
}: {
  data: SearchResultsType;
  currentPage: number;
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}) {
  return (
    <div className="flex min-h-screen">
      {/* Search Results - Full width on mobile, 2/3 width on desktop */}
      <div className="w-full md:w-2/3">
        <div className="w-full px-4 lg:px-6 py-4">
          <SearchResults
            initialResults={data.boats}
            totalCount={data.totalCount}
            currentPage={currentPage}
            totalPages={data.totalPages}
            locations={data.locations}
          />
        </div>
      </div>

      {/* Map - Right side (1/3 width) - DESKTOP ONLY.
          Sticks just below the navbar; height fills the remaining viewport.
          Uses --header-h (defined in globals.css) so this never drifts if
          the navbar height changes, and 100dvh for correct mobile-Safari
          behavior when the URL bar collapses. */}
      <div className="hidden md:block md:w-1/3">
        <div className="sticky top-[var(--header-h)] h-[calc(100dvh-var(--header-h))] w-full">
          <VisGLSearchMap locations={data.locations} boundingBox={boundingBox} />
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
  const data = await searchBoats({
    searchParams: normalizedParams,
    limit: 12,
    page: currentPage,
  });

  return (
    <main>
      {/* Unified search content - Stable key to prevent map remounting */}
      <Suspense key="boat-search-results" fallback={<SearchSkeleton />}>
        <SearchPageContent data={data} currentPage={currentPage} boundingBox={boundingBox} />
      </Suspense>
    </main>
  );
}
