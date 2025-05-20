"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Map, X } from "lucide-react";
import VisGLSearchMap, { DEFAULT_US_BOUNDS } from "@/components/boats/search/map/VisGLSearchMap";
import { BoatLocation } from "@/lib/types/types";
import { useSearchURL } from "@/hooks/useSearchURL";
import { parseBooleanParam } from "@/lib/utils/search-params-utils";

interface MapToggleClientProps {
  locations: BoatLocation[];
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}

export default function MapToggleClient({ locations, boundingBox }: MapToggleClientProps) {
  const { searchParams, updateSearchParams } = useSearchURL();
  const [showMap, setShowMap] = useState(() => parseBooleanParam(searchParams.get('map_toggle')));

  // Sync state with URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const mapToggleParam = searchParams.get('map_toggle');
    setShowMap(parseBooleanParam(mapToggleParam));
  }, [searchParams]);

  // Toggle map visibility and persist in URL
  const toggleMap = () => {
    const newState = !showMap;
    setShowMap(newState);
    updateSearchParams({ map_toggle: newState });
  };

  return (
    <>
      {/* Mobile map toggle button - fixed position at the bottom */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <Button
          onClick={toggleMap}
          className={`rounded-full h-12 w-12 shadow-lg ${showMap ? 'bg-white text-gray-800' : 'bg-[#1E293B] text-white'}`}
          aria-label={showMap ? "Hide map" : "Show map"}
        >
          {showMap ? <X className="h-5 w-5" /> : <Map className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile map overlay - only visible when toggled */}
      {showMap && (
        <div className="md:hidden fixed inset-0 z-20 bg-white">
          <div className="absolute top-2 left-2 right-2 z-30 flex justify-between items-center p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMap}
                className="rounded-full h-9 w-9 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
              <span className="font-medium">Map View</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMap}
              className="text-sm"
            >
              List View
            </Button>
          </div>
          <div className="h-full w-full">
            <VisGLSearchMap 
              locations={locations} 
              boundingBox={boundingBox || DEFAULT_US_BOUNDS}
            />
          </div>
        </div>
      )}
    </>
  );
} 