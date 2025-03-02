"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { BoatLocation } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchMapProps {
  locations: BoatLocation[];
}

// Map ID for Advanced Markers - Not using this for now to avoid pink water
// const MAP_ID = "8e0a97af9386fef";

// Map configuration constants
const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "calc(100vh - 200px)",
  minHeight: "600px",
};

// Default center is Miami
const DEFAULT_CENTER = {
  lat: 25.7617,
  lng: -80.1918,
};

// Map styling options
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  // mapId removed to fix pink water issue
  styles: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }, { lightness: 17 }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }, { lightness: 18 }]
    },
    {
      featureType: "road.local",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }, { lightness: 16 }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#dedede" }, { lightness: 21 }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }]
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// Color mapping for boat categories
const CATEGORY_COLORS: Record<string, string> = {
  YACHT: "#1E293B",
  PONTOON: "#0EA5E9",
  SAILBOAT: "#10B981",
  FISHING: "#F59E0B",
  SPEEDBOAT: "#EF4444",
  HOUSEBOAT: "#8B5CF6",
  JET_SKI: "#EC4899",
  OTHER: "#6B7280",
};

export default function SearchMap({ locations = [] }: SearchMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BoatLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  // Check if API key is missing
  useEffect(() => {
    if (!apiKey) {
      console.error("Google Maps API key is missing");
      setError("Google Maps API key is not configured");
    }
  }, [apiKey]);

  // Keep libraries as a static array to prevent reloading
  const libraries = useMemo(() => ["places"], []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  // Group nearby locations to prevent overlapping markers
  const groupedLocations = useMemo(() => {
    if (locations.length <= 1) return locations;
    
    const groups: BoatLocation[][] = [];
    const processed = new Set<string>();
    
    // Distance threshold in degrees (roughly 100 meters)
    const threshold = 0.001;
    
    locations.forEach(location => {
      if (processed.has(location.id)) return;
      
      const group = [location];
      processed.add(location.id);
      
      locations.forEach(otherLocation => {
        if (
          location.id !== otherLocation.id && 
          !processed.has(otherLocation.id) &&
          Math.abs(location.latitude - otherLocation.latitude) < threshold &&
          Math.abs(location.longitude - otherLocation.longitude) < threshold
        ) {
          group.push(otherLocation);
          processed.add(otherLocation.id);
        }
      });
      
      groups.push(group);
    });
    
    // Return the first location from each group, with a count property
    return groups.map(group => ({
      ...group[0],
      count: group.length,
      groupedBoats: group
    }));
  }, [locations]);

  // Calculate map bounds based on all locations
  const getBounds = useCallback(() => {
    if (!map || locations.length === 0) return;
    
    try {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add all boat locations to bounds
      locations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.latitude, location.longitude));
      });
      
      // Fit the map to these bounds
      map.fitBounds(bounds);
      
      // If we only have one location, zoom out a bit
      if (locations.length === 1) {
        map.setZoom(14);
      }
    } catch (err) {
      console.error("Error calculating map bounds:", err);
    }
  }, [map, locations]);

  // Initialize map
  const onLoad = useCallback((map: google.maps.Map) => {
    try {
      setMap(map);
      
      // Set initial center and zoom
      if (locations.length === 0) {
        map.setCenter(DEFAULT_CENTER);
        map.setZoom(12);
      } else {
        // Force bounds calculation
        setTimeout(() => {
          try {
            const bounds = new window.google.maps.LatLngBounds();
            
            // Add all boat locations to bounds
            locations.forEach(location => {
              bounds.extend(new window.google.maps.LatLng(location.latitude, location.longitude));
            });
            
            // Fit the map to these bounds
            map.fitBounds(bounds);
            
            // If we only have one location, zoom out a bit
            if (locations.length === 1) {
              map.setZoom(14);
            }
          } catch (err) {
            console.error("Error in delayed bounds calculation:", err);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [locations]);

  // Clean up on unmount
  const onUnmount = useCallback(() => {
    // Clean up markers
    markers.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    setMarkers([]);
    setMap(null);
  }, [markers]);
  
  // Update bounds when locations change
  useEffect(() => {
    if (map && locations.length > 0) {
      getBounds();
    }
  }, [map, locations, getBounds]);
  
  // Handle errors
  useEffect(() => {
    if (loadError) {
      console.error("Error loading Google Maps:", loadError);
      setError("Failed to load Google Maps");
    }
  }, [loadError]);
  
  // Create and manage markers
  useEffect(() => {
    if (!isLoaded || !map || !window.google) return;
    
    // Clean up existing markers
    markers.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    
    // Create new markers
    const newMarkers: google.maps.Marker[] = [];
    
    groupedLocations.forEach(location => {
      try {
        // Get color for the marker based on category
        const color = CATEGORY_COLORS[location.category] || CATEGORY_COLORS.OTHER;
        
        // Create SVG marker icon
        const svgMarker = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: 10,
        };
        
        // Create the marker
        const marker = new google.maps.Marker({
          map,
          position: { lat: location.latitude, lng: location.longitude },
          icon: svgMarker,
          title: location.name,
          label: location.count && location.count > 1 ? {
            text: location.count.toString(),
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold'
          } : undefined
        });
        
        // Add click event
        marker.addListener('click', () => {
          setSelectedLocation(location);
        });
        
        newMarkers.push(marker);
      } catch (err) {
        console.error("Error creating marker:", err);
      }
    });
    
    setMarkers(newMarkers);
    
    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
    };
  }, [isLoaded, map, groupedLocations]);

  if (error || loadError) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-2">
        <MapPin className="h-8 w-8 mb-2 text-gray-400" />
        <p className="text-lg font-medium">Error loading map</p>
        <p className="text-sm opacity-75">Please check your internet connection and try again</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={DEFAULT_CENTER}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={MAP_OPTIONS}
    >
      {/* Debug info */}
      {locations.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10 text-sm">
          No locations to display
        </div>
      )}
      
      {/* Info window for selected location */}
      {selectedLocation && (
        <InfoWindow
          position={{
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude
          }}
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
    </GoogleMap>
  );
} 