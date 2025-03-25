"use client";

import { useState, useEffect } from "react";
import { BoatLocation } from "@/types/types";
import MapContainer from "@/components/map/MapContainer";
import { Loader2, MapPin } from "lucide-react";

interface SearchMapProps {
  locations: BoatLocation[];
}

export default function VisGLSearchMap({ locations = [] }: SearchMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading experience for smoother transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured");
    }
  }, []);
  
  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-2">
        <MapPin className="h-8 w-8 mb-2 text-gray-400" />
        <p className="text-lg font-medium">Error loading map</p>
        <p className="text-sm opacity-75">Please check your internet connection and try again</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <MapContainer 
      locations={locations}
      className="rounded-[2rem]"
    />
  );
} 