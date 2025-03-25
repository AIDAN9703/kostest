"use client";

import { useEffect, useState, useRef } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/types/types";

interface MapMarkerProps {
  location: BoatLocation;
  onClick: (location: BoatLocation) => void;
  clusterer: any; // MarkerLibrary
}

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

export default function MapMarker({ location, onClick, clusterer }: MapMarkerProps) {
  const map = useMap();
  const markerRef = useRef(null);
  const [markerElement, setMarkerElement] = useState<HTMLDivElement | null>(null);
  
  // Get color for the marker based on category
  const color = CATEGORY_COLORS[location.category] || CATEGORY_COLORS.OTHER;
  
  // Handle marker click
  const handleClick = () => {
    onClick(location);
  };
  
  // Style for the marker
  const markerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: location.count && location.count > 1 ? "32px" : "20px",
    height: location.count && location.count > 1 ? "32px" : "20px",
    backgroundColor: color,
    border: "2px solid white",
    borderRadius: "50%",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    color: "white",
    fontSize: "10px",
    fontWeight: 700,
    transition: "transform 0.2s ease",
  };

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: location.latitude, lng: location.longitude }}
      onClick={handleClick}
      title={location.name}
    >
      <div style={markerStyle} className="hover:scale-110">
        {location.count && location.count > 1 ? location.count : ""}
      </div>
    </AdvancedMarker>
  );
} 