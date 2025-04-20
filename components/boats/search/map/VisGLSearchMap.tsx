"use client";

import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/types/types";
import { Loader2, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchMapProps {
  locations: BoatLocation[];
  boundingBox?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}

// Inner component to use map instance
function MapContent({ locations, boundingBox }: { 
  locations: BoatLocation[]; 
  boundingBox?: SearchMapProps['boundingBox'];
}) {
  const map = useMap();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<BoatLocation | null>(null);
  const [mapMoved, setMapMoved] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null>(null);
  const [userViewport, setUserViewport] = useState<{
    center: google.maps.LatLngLiteral;
    zoom: number;
  } | null>(null);
  
  // Track when map is moved
  useEffect(() => {
    if (!map || !window.google) return;
    
    const handleBoundsChanged = () => {
      if (!map) return;
      
      const bounds = map.getBounds();
      if (!bounds) return;
      
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      // Show search button when map is moved
      setMapMoved(true);
      
      // Save current bounds and viewport for search
      setCurrentBounds({
        ne: { lat: ne.lat(), lng: ne.lng() },
        sw: { lat: sw.lat(), lng: sw.lng() }
      });
      
      setUserViewport({
        center: { 
          lat: map.getCenter()!.lat(), 
          lng: map.getCenter()!.lng() 
        },
        zoom: map.getZoom()!
      });
    };
    
    // Listen for bounds changed events
    map.addListener('bounds_changed', handleBoundsChanged);
    
    return () => {
      if (map) {
        google.maps.event.clearListeners(map, 'bounds_changed');
      }
    };
  }, [map]);
  
  // Handle search this area button click
  const handleSearchThisArea = useCallback(() => {
    if (!currentBounds || !userViewport) return;
    
    // Create a new URLSearchParams object based on the current URL
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Save bounds for API filtering
    newParams.set('ne_lat', currentBounds.ne.lat.toString());
    newParams.set('ne_lng', currentBounds.ne.lng.toString());
    newParams.set('sw_lat', currentBounds.sw.lat.toString());
    newParams.set('sw_lng', currentBounds.sw.lng.toString());
    
    // Save exact viewport to maintain user's view
    newParams.set('center_lat', userViewport.center.lat.toString());
    newParams.set('center_lng', userViewport.center.lng.toString());
    newParams.set('zoom_level', userViewport.zoom.toString());
    
    // Ensure map is visible
    newParams.set('map_toggle', 'on');
    
    // Reset to page 1
    newParams.set('page', '1');
    
    // Hide search button until next map movement
    setMapMoved(false);
    
    // Navigate to the new URL
    router.push(`/boats/search?${newParams.toString()}`);
  }, [currentBounds, userViewport, router, searchParams]);
  
  // Initialize map view
  useEffect(() => {
    if (!map || !window.google || hasInitialized) return;
    
    // First check if we have exact viewport settings from URL
    const centerLat = searchParams.get('center_lat');
    const centerLng = searchParams.get('center_lng');
    const zoomLevel = searchParams.get('zoom_level');
    
    if (centerLat && centerLng && zoomLevel) {
      // User clicked "Search this area" - maintain exact viewport
      map.setCenter({
        lat: parseFloat(centerLat),
        lng: parseFloat(centerLng)
      });
      map.setZoom(parseFloat(zoomLevel));
      setHasInitialized(true);
      return;
    }
    
    // Otherwise, calculate proper bounds
    let bounds: google.maps.LatLngBounds;
    
    if (boundingBox) {
      // Use bounds from URL parameters
      bounds = new window.google.maps.LatLngBounds(
        { lat: boundingBox.sw.lat, lng: boundingBox.sw.lng },
        { lat: boundingBox.ne.lat, lng: boundingBox.ne.lng }
      );
      setCurrentBounds(boundingBox);
    } 
    else if (locations.length > 0) {
      // Create bounds from boat locations
      bounds = new window.google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
      });
    } 
    else {
      // Default to Miami area if no locations or bounds
      bounds = new window.google.maps.LatLngBounds(
        { lat: 25.7090, lng: -80.3200 },
        { lat: 25.8550, lng: -80.1200 }
      );
    }
    
    // Fit map to calculated bounds
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    
    // Apply zoom constraints after bounds adjustment
    const listener = map.addListener('idle', () => {
      const currentZoom = map.getZoom();
      
      // Enforce min/max zoom levels
      if (currentZoom && currentZoom > 15) {
        map.setZoom(15);
      } else if (currentZoom && currentZoom < 9) {
        map.setZoom(9);
      }
      
      google.maps.event.removeListener(listener);
      setHasInitialized(true);
    });
    
    return () => {
      if (listener) google.maps.event.removeListener(listener);
    };
  }, [map, locations, boundingBox, hasInitialized, searchParams]);
  
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
      
      {/* Search this area button - show when map has been moved */}
      {mapMoved && (
        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <Button 
            onClick={handleSearchThisArea}
            className="bg-white text-[#2a3656] hover:bg-slate-100 border border-slate-200 shadow-md flex items-center gap-2 py-2 px-4 rounded-full"
          >
            <Search className="h-4 w-4" />
            Search this area
          </Button>
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

export default function VisGLSearchMap({ locations = [], boundingBox }: SearchMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default map center (Miami)
  const defaultCenter = { lat: 25.7617, lng: -80.1918 };
  
  // Check for Google Maps API
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        // If not loaded yet, check again in 100ms
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    
    // Simulate loading experience for smoother transitions
    const timer = setTimeout(() => {
      checkGoogleMapsLoaded();
    }, 500);
    
    return () => clearTimeout(timer);
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
    <APIProvider apiKey=''>
      <Map
        mapId="20b5a35bbeb964a1"
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
        minZoom={1}
        maxZoom={15}
        restriction={{
          latLngBounds: {
            north: 49.5, // Northern US border
            south: 21, // Southern tip of Florida
            east: -66.0, // Eastern US coast
            west: -125.0 // Western US coast
          },
          strictBounds: true,
        }}
        className="w-full h-full rounded-[2rem]"
      >
        <MapContent locations={locations} boundingBox={boundingBox} />
      </Map>
    </APIProvider>
  );
} 