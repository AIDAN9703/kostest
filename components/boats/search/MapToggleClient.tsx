"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Map, X } from "lucide-react";
import VisGLSearchMap from "@/components/boats/search/map/VisGLSearchMap";
import { getBoats } from "@/lib/actions/boat-actions";
import { SearchParamsType } from "@/types/types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MapToggleClient({ searchParams }: { searchParams: SearchParamsType }) {
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsObj = useSearchParams();

  // Check if map_toggle is in the URL
  useEffect(() => {
    const mapToggleParam = searchParamsObj.get('map_toggle');
    if (mapToggleParam === 'on') {
      setShowMap(true);
    }
  }, [searchParamsObj]);

  // Update URL when map toggle changes
  const updateMapToggleInUrl = (show: boolean) => {
    const params = new URLSearchParams(searchParamsObj.toString());
    if (show) {
      params.set('map_toggle', 'on');
    } else {
      params.delete('map_toggle');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Load map data when the map is shown
  useEffect(() => {
    if (showMap) {
      setIsLoading(true);
      const loadMapData = async () => {
        try {
          const data = await getBoats({
            searchParams,
            limit: 100,
            page: 1,
          });
          setMapData(data.locations || []);
        } catch (error) {
          console.error("Error loading map data:", error);
          // Fallback location
          setMapData([{
            id: "error-fallback",
            name: "Default Location",
            latitude: 25.7617,
            longitude: -80.1918,
            category: "YACHT",
            price: 500
          }]);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadMapData();
    }
  }, [showMap, searchParams]);

  const toggleMap = () => {
    const newState = !showMap;
    setShowMap(newState);
    updateMapToggleInUrl(newState);
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
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E293B]"></div>
              </div>
            ) : (
              <VisGLSearchMap locations={mapData} />
            )}
          </div>
        </div>
      )}
    </>
  );
} 