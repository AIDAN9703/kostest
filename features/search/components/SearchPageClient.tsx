"use client";

import { useCallback } from "react";

import SearchResults from "./SearchResults";
import SearchFilterBar from "./SearchFilterBar";
import VisGLSearchMap from "./map/VisGLSearchMap";
import { useSearchURL } from "@/features/search/hooks/useSearchURL";
import { SearchResults as SearchResultsType } from "@/shared/lib/types/types";
import { cn } from "@/shared/lib/utils/general-utils";

interface SearchPageClientProps {
  data: SearchResultsType;
  currentPage: number;
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}

export default function SearchPageClient({
  data,
  currentPage,
  boundingBox,
}: SearchPageClientProps) {
  const { searchParams, updateSearchParams } = useSearchURL();
  const showMap = searchParams.get("map") === "1";

  const handleMapToggle = useCallback(
    (enabled: boolean) => {
      updateSearchParams({ map: enabled ? "1" : null });
    },
    [updateSearchParams],
  );

  return (
    <div className="min-h-screen bg-white">
      <SearchFilterBar showMap={showMap} onMapToggle={handleMapToggle} />

      <div className="flex">
        <div
          className={cn(
            "min-w-0 flex-1",
            showMap && "md:max-w-[52%] lg:max-w-[50%]",
          )}
        >
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <SearchResults
              initialResults={data.boats}
              totalCount={data.totalCount}
              currentPage={currentPage}
              totalPages={data.totalPages}
              showMap={showMap}
            />
          </div>
        </div>

        {showMap && (
          <div className="hidden md:block md:w-[48%] lg:w-1/2">
            <div className="sticky top-[calc(var(--header-h)+3.25rem)] h-[calc(100dvh-var(--header-h)-3.25rem)]">
              <VisGLSearchMap
                locations={data.locations}
                boundingBox={boundingBox}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
