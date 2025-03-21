'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, RefreshCcw } from 'lucide-react';
import { BoatLocation } from '@/types/types';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

// Category color mapping
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

// Default center is Miami
const DEFAULT_CENTER = {
  lat: 25.7617,
  lng: -80.1918,
};

// Add type declaration for the window global
declare global {
  interface Window {
    initMap: () => void;
    markerClusterer?: {
      MarkerClusterer: new (options: { map: google.maps.Map, markers: google.maps.Marker[] }) => any;
    };
  }
}

interface SimpleMapProps {
  locations: BoatLocation[];
}

export default function SimpleMap({ locations = [] }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BoatLocation | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get the API key from the environment
  const getApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not defined');
    }
    return apiKey;
  };

  // Handle loading the Google Maps API script
  useEffect(() => {
    if (isLoaded) return;

    // Set a timeout for loading
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setLoadingTimeout(true);
    }, 10000); // 10 seconds timeout

    const loadGoogleMapsScript = () => {
      try {
        const apiKey = getApiKey();
        
        // If the script is already in the document, don't add it again
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          console.log('Google Maps script already loaded');
          setIsLoaded(true);
          return;
        }

        console.log('Loading Google Maps script...');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,visualization&callback=initMap`;
        script.async = true;
        script.defer = true;
        scriptRef.current = script;

        // Define the callback function
        window.initMap = () => {
          console.log('Google Maps script loaded successfully');
          setIsLoaded(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        // Handle script load error
        script.onerror = () => {
          setError('Failed to load Google Maps script');
          setIsLoading(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        document.head.appendChild(script);
      } catch (err: any) {
        console.error('Error loading Google Maps script:', err);
        setError(err.message || 'Error loading Google Maps');
        setIsLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    loadGoogleMapsScript();

    return () => {
      // Clean up
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Remove the global callback
      window.initMap = undefined as any;
    };
  }, [isLoaded]);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      console.log('Initializing map...');
      
      // Create the map
      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 10,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }, { lightness: 17 }] },
          { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 20 }] },
          { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }, { lightness: 17 }] },
          { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 18 }] },
          { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 16 }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 21 }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dedede" }, { lightness: 21 }] },
          { elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }] },
          { elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] }
        ]
      });

      // Add markers if locations exist
      if (locations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        const markers: google.maps.Marker[] = [];

        // Create markers for each location
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: location.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: CATEGORY_COLORS[location.category] || CATEGORY_COLORS.OTHER,
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 10,
            }
          });

          // Add click listener to show info window
          marker.addListener('click', () => {
            setSelectedLocation(location);
          });

          // Add to bounds for map centering
          bounds.extend(marker.getPosition()!);
          markers.push(marker);
        });

        // Fit map to markers
        map.fitBounds(bounds);

        // Adjust zoom if there's only one marker
        if (locations.length === 1) {
          google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            map.setZoom(14);
          });
        }

        // Add marker clustering if there are multiple markers
        if (markers.length > 1) {
          // Load the MarkerClusterer script dynamically
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
          script.onload = () => {
            // Now we can safely use the markerClusterer
            if (window.markerClusterer) {
              new window.markerClusterer.MarkerClusterer({ map, markers });
            }
          };
          document.head.appendChild(script);
        }
      }

      // Add map click listener to close info window
      map.addListener('click', () => {
        setSelectedLocation(null);
      });

      // Map is ready
      setIsLoading(false);
      console.log('Map initialized successfully');
      
    } catch (err: any) {
      console.error('Error initializing map:', err);
      setError(err.message || 'Error initializing map');
      setIsLoading(false);
    }
  }, [isLoaded, locations]);

  // Handle retry
  const handleRetry = () => {
    setIsLoaded(false);
    setIsLoading(true);
    setError(null);
    setLoadingTimeout(false);
    
    // Remove the old script if it exists
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
  };

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-2 p-4">
        <MapPin className="h-8 w-8 mb-2 text-gray-400" />
        <p className="text-lg font-medium">Error loading map</p>
        <p className="text-sm opacity-75 text-center mb-4">
          {error}. Please check your internet connection.
        </p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2C3E50] transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100">
        {loadingTimeout ? (
          <div className="text-center p-6">
            <MapPin className="h-10 w-10 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Map is taking longer than expected</h3>
            <p className="text-sm text-gray-500 mb-4">
              This could be due to slow network or an issue with Google Maps
            </p>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2C3E50] transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Loading Map
            </button>
          </div>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Info Window */}
      {selectedLocation && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-[280px] bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
          <div className="relative h-[140px] bg-gray-100">
            {selectedLocation.imageUrl ? (
              <Image
                src={selectedLocation.imageUrl}
                alt={selectedLocation.name}
                fill
                sizes="280px"
                className="object-cover"
                onError={(e) => {
                  // Replace error event with default icon
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full h-full flex items-center justify-center';
                    placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md">
              {selectedLocation.category}
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-semibold text-[#1E293B] text-sm">{selectedLocation.name}</h3>
            <p className="text-blue-600 text-sm font-semibold mt-1">{formatCurrency(selectedLocation.price)}/hr</p>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link 
                href={`/boats/${selectedLocation.id}`} 
                className="text-xs text-blue-600 hover:underline block text-center"
              >
                View details
              </Link>
            </div>
          </div>
          
          <button 
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
            onClick={() => setSelectedLocation(null)}
          >
            <span className="text-white text-xs">×</span>
          </button>
        </div>
      )}
      
      {/* No results message */}
      {locations.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md z-10 text-center">
          <MapPin className="h-6 w-6 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No boats in this area</p>
          <p className="text-xs text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
} 