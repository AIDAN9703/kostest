"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/types/types";
import { Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchMapProps {
  locations: BoatLocation[];
}

// Inner component to use map instance
function MapContent({ locations }: { locations: BoatLocation[] }) {
  const map = useMap();
  const [selectedLocation, setSelectedLocation] = useState<BoatLocation | null>(null);
  
  // Fit map to bounds when locations or map changes
  useEffect(() => {
    if (!map || !window.google || locations.length === 0) return;
    
    // Create bounds that include all markers
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach(location => {
      bounds.extend({ lat: location.latitude, lng: location.longitude });
    });
    
    // Fit the map to these bounds
    map.fitBounds(bounds);
    
    // If only one location, zoom in closer
    if (locations.length === 1) {
      map.setZoom(14);
    }
  }, [map, locations]);
  
  // Handle marker click
  const handleMarkerClick = (location: BoatLocation) => {
    setSelectedLocation(location);
  };
  
  return (
    <>
      {/* No locations message */}
      {locations.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10 text-sm">
          No boats found in this area
        </div>
      )}
      
      {/* Render all markers */}
      {locations.map(location => {
        // Format the price for display
        const displayPrice = formatCurrency(location.price).replace(/\.00$/, '');
        
        return (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            onClick={() => handleMarkerClick(location)}
            title={location.name}
          >
            <div 
              style={{
                backgroundColor: "#2a3656",
                padding: "4px 8px",
                borderRadius: "4px",
                color: "white",
                fontWeight: 700,
                fontSize: "12px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255,255,255,0.5)",
                minWidth: location.count && location.count > 1 ? "auto" : "auto",
                textAlign: "center",
                transform: "translateY(-50%)",
              }}
              className="hover:scale-110 transition-transform"
            >
              {location.count && location.count > 1 
                ? `${location.count} boats` 
                : displayPrice}
            </div>
          </AdvancedMarker>
        );
      })}
      
      {/* Info Window for selected location */}
      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div className="max-w-[250px]">
            {selectedLocation.count && selectedLocation.count > 1 && selectedLocation.groupedBoats ? (
              // Multiple boats at this location
              <div className="p-1">
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedLocation.count} boats at this location
                </h3>
                <div className="max-h-[200px] overflow-y-auto space-y-3">
                  {selectedLocation.groupedBoats.map(boat => (
                    <div key={boat.id} className="border-b border-gray-100 pb-2">
                      <Link 
                        href={`/boats/${boat.id}`}
                        className="text-sm font-medium text-[#2C3E50] hover:underline"
                      >
                        {boat.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(boat.price)}/hour
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single boat
              <div className="p-1">
                <Link 
                  href={`/boats/${selectedLocation.id}`}
                  className="font-medium text-[#2C3E50] hover:underline"
                >
                  {selectedLocation.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(selectedLocation.price)}/hour
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full text-xs h-8"
                >
                  <Link href={`/boats/${selectedLocation.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function VisGLSearchMap({ locations = [] }: SearchMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default map center (Miami)
  const defaultCenter = { lat: 25.7617, lng: -80.1918 };
  
  // Check for API key
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured");
    } else {
      // Simulate loading experience for smoother transitions
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Error state
  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-2">
        <MapPin className="h-8 w-8 mb-2 text-gray-400" />
        <p className="text-lg font-medium">Error loading map</p>
        <p className="text-sm opacity-75">{error}</p>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <Map
        mapId={"20b5a35bbeb964a1"}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        scaleControl={true}
        streetViewControl={false}
        rotateControl={false}
        fullscreenControl={true}
        clickableIcons={false}
        defaultCenter={defaultCenter}
        defaultZoom={10}
        className="w-full h-full rounded-[2rem]"
      >
        <MapContent locations={locations} />
      </Map>
    </APIProvider>
  );
} 