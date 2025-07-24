"use client";

import { useState } from "react";
import { Boat } from "@/shared/types/types";
import { 
  Ship, 
  Anchor, 
  Calendar, 
  Ruler, 
  Users, 
  Bed, 
  Bath, 
  Gauge, 
  Fuel, 
  Droplet,
  Layers,
  Globe,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface VesselSpecsProps {
  boat: Boat;
}

export function BoatSpecs({ boat }: VesselSpecsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Define how many specs to show in collapsed state
  const initialVisibleCount = 6;

  // Get all specs that have values
  const allSpecs = [
    { icon: <Ship className="h-5 w-5" />, label: "Make", value: boat.make },
    { icon: <Anchor className="h-5 w-5" />, label: "Model", value: boat.model },
    { icon: <Calendar className="h-5 w-5" />, label: "Year Built", value: boat.yearBuilt?.toString() },
    { icon: <Ruler className="h-5 w-5" />, label: "Length", value: boat.lengthFt ? `${boat.lengthFt} ft` : undefined },
    { icon: <Users className="h-5 w-5" />, label: "Capacity", value: boat.capacity ? `${boat.capacity} guests` : undefined },
    { icon: <Bed className="h-5 w-5" />, label: "Cabins", value: (boat.cabins || boat.numOfCabins)?.toString() },
    { icon: <Bath className="h-5 w-5" />, label: "Bathrooms", value: (boat.bathrooms || boat.numOfBathrooms)?.toString() },
    { icon: <Bed className="h-5 w-5" />, label: "Sleeps", value: (boat.sleeps || boat.sleepsNum) ? `${boat.sleeps || boat.sleepsNum} guests` : undefined },
    { icon: <Gauge className="h-5 w-5" />, label: "Cruising Speed", value: boat.cruisingSpeed ? `${boat.cruisingSpeed} knots` : undefined },
    { icon: <Gauge className="h-5 w-5" />, label: "Max Speed", value: boat.maxSpeed ? `${boat.maxSpeed} knots` : undefined },
    { icon: <Fuel className="h-5 w-5" />, label: "Fuel Type", value: (boat as any)['fuelType'] },
    { icon: <Droplet className="h-5 w-5" />, label: "Engine Type", value: (boat as any)['engineType'] },
    { icon: <Globe className="h-5 w-5" />, label: "Range", value: boat.range ? `${boat.range} nm` : undefined },
    { icon: <Layers className="h-5 w-5" />, label: "Weight", value: boat.weight ? `${boat.weight} lbs` : undefined }
  ].filter(spec => spec.value);

  // Determine which specs to display based on expanded state
  const specsToDisplay = isExpanded ? allSpecs : allSpecs.slice(0, initialVisibleCount);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Vessel Specifications</h2>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${!isExpanded ? "relative" : ""}`}>
        {specsToDisplay.map((spec, index) => (
          <SpecItem 
            key={`${spec.label}-${index}`}
            icon={spec.icon}
            label={spec.label}
            value={spec.value}
          />
        ))}
      </div>

      {allSpecs.length > initialVisibleCount && (
        <div className="flex justify-center pt-2">
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

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

function SpecItem({ icon, label, value }: SpecItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-gray-50 rounded-full p-3 text-gray-600 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
} 