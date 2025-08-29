"use client";

import { useState } from "react";
import { Boat } from "@/shared/types/types";
import { CheckCircle2, Music, Waves, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

interface FeaturesAmenitiesProps {
  boat: Boat;
}

export function FeaturesAmenities({ boat }: FeaturesAmenitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Define the number of items to show per category when collapsed
  const initialVisibleCount = 6;
  
  // Categorize features for better organization
  const features = boat.features || [];
  const amenities = boat.amenities || [];
  const safetyEquipment = boat.safetyEquipment || [];
  
  if (features.length === 0 && amenities.length === 0 && safetyEquipment.length === 0) {
    return null;
  }

  const visibleFeatures = isExpanded ? features : features.slice(0, initialVisibleCount);
  const visibleAmenities = isExpanded ? amenities : amenities.slice(0, initialVisibleCount);
  const visibleSafetyItems = isExpanded ? safetyEquipment : safetyEquipment.slice(0, initialVisibleCount);
  
  // Determine if we need a "Show More" button (if any category has more items than initialVisibleCount)
  const needsShowMore = 
    features.length > initialVisibleCount || 
    amenities.length > initialVisibleCount || 
    safetyEquipment.length > initialVisibleCount;
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features & Amenities</h2>
      
      {/* Features Section */}
      {features.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
            <Waves className="h-5 w-5 text-primary" /> 
            Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
            {visibleFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Amenities Section */}
      {amenities.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
            <Music className="h-5 w-5 text-primary" /> 
            Amenities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
            {visibleAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Safety Equipment Section */}
      {safetyEquipment.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
            <ShieldAlert className="h-5 w-5 text-primary" /> 
            Safety Equipment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
            {visibleSafetyItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show More / Show Less Button */}
      {needsShowMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="text-primary flex items-center gap-1 hover:bg-primary/5"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 