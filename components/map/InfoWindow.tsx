"use client";

import { useState, useEffect } from "react";
import { InfoWindow } from "@vis.gl/react-google-maps";
import { BoatLocation } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InfoWindowContentProps {
  location: BoatLocation;
  position: { lat: number; lng: number };
  onClose: () => void;
}

export default function InfoWindowContent({ location, position, onClose }: InfoWindowContentProps) {
  return (
    <InfoWindow position={position} onCloseClick={onClose}>
      <div className="max-w-[250px]">
        {location.count && location.count > 1 && location.groupedBoats ? (
          // Multiple boats at this location
          <div className="p-1">
            <h3 className="font-medium text-gray-900 mb-2">
              {location.count} boats at this location
            </h3>
            <div className="max-h-[200px] overflow-y-auto space-y-3">
              {location.groupedBoats.map(boat => (
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
              href={`/boats/${location.id}`}
              className="font-medium text-[#2C3E50] hover:underline"
            >
              {location.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(location.price)}/hour
            </p>
            <Button 
              asChild
              variant="outline" 
              size="sm" 
              className="mt-2 w-full text-xs h-8"
            >
              <Link href={`/boats/${location.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        )}
      </div>
    </InfoWindow>
  );
} 