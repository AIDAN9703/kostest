"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { useSearchURL } from "@/features/search/hooks/useSearchURL";

const POPULAR_DESTINATIONS = [
  {
    name: "Miami",
    params:
      "near=Miami%2C%20FL%2C%20USA&ne_lat=25.8550&ne_lng=-80.1200&sw_lat=25.7090&sw_lng=-80.3200",
  },
  {
    name: "Fort Lauderdale",
    params: "near=Fort%20Lauderdale%2C%20FL%2C%20USA",
  },
  {
    name: "Naples",
    params: "near=Naples%2C%20FL%2C%20USA",
  },
] as const;

export default function SearchResultsFallback() {
  const { clearSearchParams } = useSearchURL();
  const router = useRouter();

  return (
    <div className="py-16 text-center">
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        No boats match your search
      </h3>
      <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground">
        Try adjusting your filters or exploring a popular destination.
      </p>

      <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={clearSearchParams} className="rounded-full">
          Clear all filters
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="rounded-full"
        >
          Go back
        </Button>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">Popular destinations</p>
      <div className="flex flex-wrap justify-center gap-2">
        {POPULAR_DESTINATIONS.map((dest) => (
          <button
            key={dest.name}
            type="button"
            onClick={() => router.push(`/boats/search?${dest.params}`)}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-foreground transition hover:border-gray-300 hover:bg-gray-50"
          >
            {dest.name}
          </button>
        ))}
      </div>
    </div>
  );
}
