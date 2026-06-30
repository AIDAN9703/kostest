"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { useSearchStore } from "@/features/search/store/useSearchStore";
import { CustomPlacesAutocomplete } from "@/shared/components/ui/custom-places-autocomplete";
import { LocationData } from "@/shared/lib/types/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { parseStringParam } from "@/shared/lib/utils/search-params-utils";
import { cn } from "@/shared/lib/utils/general-utils";

interface SearchBarProps {
  variant?: "default" | "compact";
}

export default function SearchBar({ variant = "default" }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const searchParams = useSearchParams();

  // Only use Zustand for temporary autocomplete state (selectedPlace)
  // URL params are the source of truth for the actual search value
  const { setSelectedPlace } = useSearchStore();

  const router = useRouter();
  const { toast } = useToast();

  // Read current location directly from URL params (single source of truth)
  const currentLocation = parseStringParam(searchParams.get("near")) || "";

  // Extract navigation logic to reusable function
  const navigateToSearch = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.viewport) {
      const viewport = place.geometry.viewport;
      const currentParams = new URLSearchParams(searchParams.toString());

      // Update location params
      currentParams.set("near", place.formatted_address || "");
      currentParams.set("ne_lat", viewport.getNorthEast().lat().toString());
      currentParams.set("ne_lng", viewport.getNorthEast().lng().toString());
      currentParams.set("sw_lat", viewport.getSouthWest().lat().toString());
      currentParams.set("sw_lng", viewport.getSouthWest().lng().toString());
      currentParams.set("zoom_level", "13");
      // Reset to page 1 when location changes
      currentParams.set("page", "1");

      router.push(`/boats/search?${currentParams.toString()}`);
    }
  };

  const handlePlaceSelected = (locationData: LocationData) => {
    if (locationData.raw) {
      setSelectedPlace(locationData.raw);
      navigateToSearch(locationData.raw);
    }
  };

  const handleLocationError = (errorMessage: string) => {
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Handler for manual form submission (search button click)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get selected place from Zustand (temporary autocomplete state)
    const { selectedPlace } = useSearchStore.getState();

    if (!selectedPlace) {
      toast({
        title: "Invalid Location",
        description: "Please select a valid location from the suggestions",
        variant: "destructive",
      });
      return;
    }

    navigateToSearch(selectedPlace);
  };

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "w-full max-w-full"
      )}
    >
      <form
        className={cn(
          "relative flex items-center rounded-full border border-gray-200",
          isCompact ? "bg-gray-50" : "bg-white shadow-md"
        )}
        onSubmit={handleSubmit}
      >
        <div className="flex-shrink-0 pl-3.5">
          <MapPin size={isCompact ? 18 : 22} className="text-slate-400" />
        </div>

        <div className="min-w-0 flex-1">
          <CustomPlacesAutocomplete
            onPlaceSelected={handlePlaceSelected}
            onError={handleLocationError}
            placeholder={isCompact ? "Search location..." : "Where can we take you?"}
            className={cn(
              "w-full border-0 bg-transparent px-2 font-normal text-black shadow-none outline-none ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              isCompact
                ? "h-10 min-h-10 text-sm leading-normal"
                : "h-12 text-base sm:h-14 md:text-lg"
            )}
            containerClassName="w-full"
            defaultValue={currentLocation}
            isOpen={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>

        <button
          type="submit"
          className={cn(
            "flex flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90",
            isCompact ? "m-1.5 h-8 w-8" : "m-2 h-12 w-12 sm:h-14 sm:w-14"
          )}
          aria-label="Search"
        >
          <Search size={isCompact ? 18 : 22} />
        </button>
      </form>
    </div>
  );
}
