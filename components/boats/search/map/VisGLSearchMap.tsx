"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/lib/types/types";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import BoatMapMarker from "./MapMarker";

// Export this constant so it can be used in other components
export const DEFAULT_US_BOUNDS = {
  ne: { lat: 48.07631048724108, lng: -66.41625985304204 },
  sw: { lat: 21.000000000000018, lng: -88.69653329054204 }
};

// Default US viewport center
const DEFAULT_US_CENTER = { 
  lat: 35.67299725018489, 
  lng: -77.55639657179204 
};

// Default zoom level for US view
const DEFAULT_US_ZOOM = 5;

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
  // State to track currently active info window
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);
  
  // Function to handle info window activation with simplified logic
  const handleInfoWindowToggle = useCallback((locationId: string, isOpen: boolean) => {
    // Simply set or clear the active ID based on isOpen flag
    setActiveInfoWindowId(isOpen ? locationId : null);
  }, []);
  
  // Track when map is moved
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    
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
  
  // Add click handler to close InfoWindows when clicking on the map
  useEffect(() => {
    if (!map || typeof google === 'undefined') return;
    
    const handleMapClick = () => {
      // Close any open InfoWindow when clicking elsewhere on the map
      setActiveInfoWindowId(null);
    };
    
    // Add click listener to the map
    map.addListener('click', handleMapClick);
    
    return () => {
      if (map) {
        google.maps.event.clearListeners(map, 'click');
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
  
  // Initialize map view - run this once when map is ready
  useEffect(() => {
    // Wait for map instance and google global to be available
    if (!map || typeof google === 'undefined') return;
    
    // Don't re-initialize if already done
    if (hasInitialized) return;
    
    try {
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
        bounds = new google.maps.LatLngBounds(
          { lat: boundingBox.sw.lat, lng: boundingBox.sw.lng },
          { lat: boundingBox.ne.lat, lng: boundingBox.ne.lng }
        );
        setCurrentBounds(boundingBox);
      } 
      else if (locations.length > 0) {
        // Create bounds from boat locations
        bounds = new google.maps.LatLngBounds();
        locations.forEach(location => {
          bounds.extend({ lat: location.latitude, lng: location.longitude });
        });
      } 
      else {
        // Default to US bounds if no locations or bounds
        bounds = new google.maps.LatLngBounds(
          { lat: DEFAULT_US_BOUNDS.sw.lat, lng: DEFAULT_US_BOUNDS.sw.lng },
          { lat: DEFAULT_US_BOUNDS.ne.lat, lng: DEFAULT_US_BOUNDS.ne.lng }
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
        } else if (currentZoom && currentZoom < 3) {
          map.setZoom(3);
        }
        
        google.maps.event.removeListener(listener);
        setHasInitialized(true);
      });
      
      return () => {
        if (listener) google.maps.event.removeListener(listener);
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      // Even with an error, mark as initialized to prevent endless retries
      setHasInitialized(true);
    }
  }, [map, locations, boundingBox, hasInitialized, searchParams]);
  
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
      
      {/* Render all boat markers */}
      {locations.map(location => (
        <BoatMapMarker 
          key={location.id} 
          location={location} 
          isActive={activeInfoWindowId === location.id}
          onToggleInfoWindow={handleInfoWindowToggle}
        />
      ))}
    </>
  );
}

export default function VisGLSearchMap({ locations = [], boundingBox }: SearchMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const mapReadyRef = useRef(false);
  
  // Add a small loading delay to ensure Google Maps script is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show a loading state while waiting for the map to be ready
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-[2rem] bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <APIProvider apiKey="" onLoad={() => { mapReadyRef.current = true; }}>
      <Map
        mapId="20b5a35bbeb964a1"
        colorScheme="LIGHT"
        gestureHandling="cooperative"
        disableDefaultUI={false}
        zoomControl={false}
        mapTypeControl={false}
        scaleControl={false}
        streetViewControl={false}
        rotateControl={false}
        fullscreenControl={true}
        clickableIcons={false}
        cameraControl={false}
        defaultCenter={DEFAULT_US_CENTER}
        defaultZoom={DEFAULT_US_ZOOM}
        minZoom={3}
        maxZoom={15}
        restriction={{
          latLngBounds: {
            north: 77.856647, // Northern bound
            south: -18.912524, // Southern bound
            east: -17.156251, // Eastern bound
            west: -178.171876 // Western bound
          },
          strictBounds: true,
        }}
        className="w-full h-full rounded-[2rem]"
      >
        <MapContent 
          locations={locations} 
          boundingBox={boundingBox} 
        />
      </Map>
    </APIProvider>
  );
}