import { MapPin } from "lucide-react";
import { Boat } from "@/shared/lib/types/types";

interface DestinationsProps {
  boat: Boat;
}

export function Destinations({ boat }: DestinationsProps) {
  const destinations = (boat.availableDestinations || []).filter(Boolean);
  if (destinations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {destinations.map((d, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/80"
        >
          <MapPin className="size-3.5 text-primary" />
          {d}
        </span>
      ))}
    </div>
  );
}
