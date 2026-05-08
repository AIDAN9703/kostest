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
  const { setSelectedPlace, setPlaceDetails } = useSearchStore();

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
    // Store temporary state for autocomplete (only needed until navigation)
    if (locationData.raw) {
      setSelectedPlace(locationData.raw);
      setPlaceDetails(locationData.raw);
      // Immediately navigate - URL becomes source of truth
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
        "w-full",
        isCompact
          ? "max-w-full"
          : "max-w-[90%] md:max-w-[75%] lg:max-w-[50%] mx-auto",
      )}
    >
      <form
        className={cn(
          "relative bg-white rounded-full border shadow-md transition-shadow duration-200 flex items-center",
          isCompact && "shadow-sm",
        )}
        onSubmit={handleSubmit}
      >
        {/* MapPin Icon */}
        <div className="flex-shrink-0 pl-4">
          <MapPin size={isCompact ? 20 : 22} className="text-slate-400" />
        </div>

        {/* Input Container */}
        <div className="flex-1 min-w-0">
          <CustomPlacesAutocomplete
            onPlaceSelected={handlePlaceSelected}
            onError={handleLocationError}
            placeholder={
              isCompact ? "Search location..." : "Where can we take you?"
            }
            className={cn(
              "w-full bg-transparent font-normal text-black outline-none ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 shadow-none px-2",
              isCompact
                ? "min-h-11 h-11 text-base leading-normal"
                : "h-12 text-base sm:h-14 md:text-lg",
            )}
            containerClassName="w-full"
            defaultValue={currentLocation}
            isOpen={isFocused}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
            className={cn(
            "m-2 flex flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90",
            isCompact ? "h-10 min-h-10 w-10" : "h-12 w-12 sm:h-14 sm:w-14",
          )}
          aria-label="Search"
        >
          <Search size={isCompact ? 20 : 22} />
        </button>
      </form>
    </div>
  );
}
