"use client";

import { useRef, useEffect } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  AdvancedMarkerAnchorPoint,
} from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/shared/lib/types/types";
import Link from "next/link";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import { Star } from "lucide-react";

interface BoatMapMarkerProps {
  location: BoatLocation;
  isActive: boolean;
  onToggleInfoWindow: (locationId: string, isOpen: boolean) => void;
}

export default function BoatMapMarker({
  location,
  isActive,
  onToggleInfoWindow,
}: BoatMapMarkerProps) {
  // Format the price for display
  const displayPrice = formatCurrency(location.price).replace(/\.00$/, "");

  // Use ref to track marker clicks vs InfoWindow clicks
  const markerRef = useRef<HTMLDivElement>(null);

  // Handle marker click to open InfoWindow - let TypeScript infer the event type
  const handleMarkerClick = () => {
    onToggleInfoWindow(location.id, true);
  };

  // Handle InfoWindow close
  const handleCloseClick = () => {
    onToggleInfoWindow(location.id, false);
  };

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isActive) {
        onToggleInfoWindow(location.id, false);
      }
    };
  }, [isActive, location.id, onToggleInfoWindow]);

  return (
    <>
      <AdvancedMarker
        position={{ lat: location.latitude, lng: location.longitude }}
        onClick={handleMarkerClick}
        title={location.name}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      >
        {/* Circle marker */}
        <div className="relative cursor-pointer" ref={markerRef}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 transition-all border-white bg-primary`}
          >
            <Image
              src="/icons/transparent-white-logo.webp"
              alt="Logo"
              width={20}
              height={20}
              className={isActive ? "scale-110" : ""}
            />
          </div>
          {/* Price label */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded shadow-xs text-[10px] font-bold text-gray-800 whitespace-nowrap">
            {displayPrice}
          </div>
        </div>
      </AdvancedMarker>

      {isActive && (
        <InfoWindow
          position={{ lat: location.latitude, lng: location.longitude }}
          onCloseClick={handleCloseClick}
          headerDisabled={true}
          className="shadow-lg!" // Add additional shadow
        >
          {location.count && location.count > 1 && location.groupedBoats ? (
            // Multiple boats at this location - compact layout
            <div className="w-[220px] px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                {location.count} boats at this location
              </h3>
              <div className="max-h-[150px] overflow-y-auto space-y-2">
                {location.groupedBoats.map((boat) => (
                  <div
                    key={boat.id}
                    className="border-b border-gray-100 pb-1.5"
                  >
                    <Link
                      href={`/boats/${boat.id}`}
                      className="text-xs font-medium text-[#2C3E50] hover:underline"
                    >
                      {boat.name}
                    </Link>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {formatCurrency(boat.price)}/hour
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single boat - horizontal card layout with image on left
            <div className="flex w-[220px] overflow-hidden rounded-md">
              {/* Left side - Image - No padding so image is flush with edge */}
              <div className="relative w-[80px] h-[80px] shrink-0">
                {location.imageUrl ? (
                  <Image
                    src={location.imageUrl}
                    alt={location.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400 text-[10px]">No image</p>
                  </div>
                )}
              </div>

              {/* Right side - Content */}
              <div className="px-2 flex-1 min-w-0">
                {/* Rating */}
                <div className="flex items-center mb-1">
                  <div className="flex items-center text-teal-500">
                    <Star className="fill-teal-500 h-3 w-3" />
                    <span className="text-[10px] font-semibold ml-0.5 whitespace-nowrap">
                      4.9 (183)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-[12px] leading-tight text-gray-900 line-clamp-2 mb-1">
                  {location.name}
                </h3>

                {/* Price */}
                <p className="text-[11px] font-bold text-gray-900">
                  {displayPrice}/hour
                </p>

                {/* Button */}
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="w-full h-7 rounded-sm text-[10px] bg-primary hover:bg-primary/80 mt-2 text-white"
                >
                  <Link href={`/boats/${location.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          )}
        </InfoWindow>
      )}
    </>
  );
}
