"use client";

import { useState, useEffect } from "react";
import { Boat } from "@/shared/types/types";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/shared/services/imagekit.service";
import { formatCurrency } from "@/shared/utils/general-utils";

interface NearbyBoatsProps {
  boat: Boat;
  limit?: number;
}

export function NearbyBoats({ boat, limit = 3 }: NearbyBoatsProps) {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get the default tier price
  const getDefaultPrice = (boat: Boat) => {
    if (!boat.pricingTiers || boat.pricingTiers.length === 0) return 0;
    
    const defaultTier = boat.pricingTiers.find(tier => tier.isDefault && tier.isActive);
    if (defaultTier) return defaultTier.price;
    
    // If no default tier, use the first active tier
    const firstActiveTier = boat.pricingTiers.find(tier => tier.isActive);
    if (firstActiveTier) return firstActiveTier.price;
    
    // Fallback to the first tier regardless of active status
    return boat.pricingTiers[0].price;
  };
  
  // Helper to get the hours display
  const getHoursDisplay = (boat: Boat) => {
    if (!boat.pricingTiers || boat.pricingTiers.length === 0) return "hour";
    
    const defaultTier = boat.pricingTiers.find(tier => tier.isDefault && tier.isActive);
    if (defaultTier) return `${defaultTier.hours}hr`;
    
    const firstActiveTier = boat.pricingTiers.find(tier => tier.isActive);
    if (firstActiveTier) return `${firstActiveTier.hours}hr`;
    
    return `${boat.pricingTiers[0].hours}hr`;
  };

  useEffect(() => {
    const fetchNearbyBoats = async () => {
      setIsLoading(true);
      try {
        // Create search params to find boats in the same location
        const params = new URLSearchParams();
        if (boat.locationLabel) {
          params.append("location", boat.locationLabel);
        }
        
        const response = await fetch(`/api/boats/search?${params.toString()}&limit=${limit}&exclude=${boat.id}`, {
          cache: 'no-store' // Ensure fresh data in Next.js 15
        });
        if (!response.ok) {
          throw new Error("Failed to fetch nearby boats");
        }
        
        const data = await response.json();
        // Filter out the current boat
        const nearbyBoats = data.boats
          .filter((b: Boat) => b.id !== boat.id)
          .slice(0, limit);
        setBoats(nearbyBoats);
      } catch (error) {
        console.error("Error fetching nearby boats:", error);
        setBoats([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (boat?.locationLabel) {
      fetchNearbyBoats();
    } else {
      setIsLoading(false);
    }
  }, [boat, limit]);

  if (!boat.locationLabel || (!isLoading && boats.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-primary font-serif">
          More from {boat.locationLabel}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Discover similar boats in this area
        </p>
      </div>

      <div className="p-5 space-y-5">
        {isLoading ? (
          // Loading skeletons
          Array(limit)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
        ) : (
          // Boat cards
          boats.map((nearbyBoat) => (
            <Link
              href={`/boats/${nearbyBoat.id}`}
              key={nearbyBoat.id}
              className="flex gap-3 group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              {/* Boat Image */}
              <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={
                    getOptimizedImageUrl(
                      nearbyBoat.mainImage || "/images/boats/placeholder.jpg",
                      { width: 100, height: 100, quality: 80 }
                    )
                  }
                  alt={nearbyBoat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              </div>

              {/* Boat Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                  {nearbyBoat.displayTitle || nearbyBoat.name}
                </h3>
                
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{nearbyBoat.locationLabel}</span>
                </div>
                
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {formatCurrency(getDefaultPrice(nearbyBoat))}<span className="text-xs font-normal text-gray-500">/{getHoursDisplay(nearbyBoat)}</span>
                </p>
              </div>
            </Link>
          ))
        )}

        {!isLoading && boats.length > 0 && (
          <Button 
            asChild
            variant="outline" 
            className="w-full mt-3"
          >
            <Link href={`/boats/search?location=${encodeURIComponent(boat.locationLabel || '')}`}>
              View all boats in {boat.locationLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 