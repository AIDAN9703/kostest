"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/types/types";
import MapMarker from "./MapMarker";
import InfoWindowContent from "./InfoWindow";
import { MapPin } from "lucide-react";

interface MapContainerProps {
  locations: BoatLocation[];
  apiKey?: string;
  onMarkerClick?: (location: BoatLocation) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

// Default center is Miami
const DEFAULT_CENTER = {
  lat: 25.7617,
  lng: -80.1918,
};

// Light-styled map with clean water color
const MAP_STYLES = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#CCDEFF" }, { lightness: 30 }]
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
];

// Inner map component to handle marker clustering and map operations
function MapContent({ locations }: { locations: BoatLocation[] }) {
  const map = useMap();
  const [selectedLocation, setSelectedLocation] = useState<BoatLocation | null>(null);
  const [clusterer, setClusterer] = useState<any>(null);
  const markerClusterer = useMapsLibrary("marker");

  // Initialize marker clusterer when library is loaded
  useEffect(() => {
    if (!map || !markerClusterer || locations.length === 0) return;
    
    // We're passing the marker library to the markers so they can use it if needed
    setClusterer(markerClusterer);
  }, [map, markerClusterer, locations]);

  // Fit map to bounds of all locations
  useEffect(() => {
    if (!map || locations.length === 0) return;

    try {
      const bounds = new google.maps.LatLngBounds();
      
      // Add all boat locations to bounds
      locations.forEach(location => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
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

  // Handle marker click
  const handleMarkerClick = useCallback((location: BoatLocation) => {
    setSelectedLocation(location);
  }, []);

  // Close info window
  const handleInfoWindowClose = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return (
    <>
      {/* Display loading or no results message */}
      {locations.length === 0 && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10 text-sm">
          No locations to display
        </div>
      )}

      {/* Render all map markers */}
      {locations.map(location => (
        <MapMarker
          key={location.id}
          location={location}
          onClick={handleMarkerClick}
          clusterer={clusterer}
        />
      ))}

      {/* Display info window for selected location */}
      {selectedLocation && (
        <InfoWindowContent
          location={selectedLocation}
          position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
          onClose={handleInfoWindowClose}
        />
      )}
    </>
  );
}

export default function MapContainer({
  locations = [],
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  center = DEFAULT_CENTER,
  zoom = 10,
  className = ""
}: MapContainerProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Check if API key is missing
  useEffect(() => {
    if (!apiKey) {
      console.error("Google Maps API key is missing");
      setError("Google Maps API key is not configured");
    }
  }, [apiKey]);

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

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-2">
        <MapPin className="h-8 w-8 mb-2 text-gray-400" />
        <p className="text-lg font-medium">Error loading map</p>
        <p className="text-sm opacity-75">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[600px] ${className}`}>
      <APIProvider apiKey={apiKey} libraries={["places", "marker"]}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="boat-charter-map"
          gestureHandling="cooperative"
          style={{
            width: "100%",
            height: "100%"
          }}
          mapTypeId="roadmap"
          disableDefaultUI={true}
          zoomControl={true}
          mapTypeControl={false}
          scaleControl={true}
          streetViewControl={false}
          rotateControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          styles={MAP_STYLES}
        >
          <MapContent locations={groupedLocations} />
        </Map>
      </APIProvider>
    </div>
  );
} 