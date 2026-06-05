"use client";

import { useMemo, useState } from "react";
import { Map, SlidersHorizontal, X } from "lucide-react";

import FilterModal from "./FilterModal";
import { useSearchURL } from "@/features/search/hooks/useSearchURL";
import {
  countActiveFilters,
  getActiveFilterTags,
  removeFilterTag,
} from "@/features/search/lib/active-filters";
import { Switch } from "@/shared/components/ui/switch";

interface SearchFilterBarProps {
  showMap: boolean;
  onMapToggle: (enabled: boolean) => void;
}

export default function SearchFilterBar({ showMap, onMapToggle }: SearchFilterBarProps) {
  const { searchParams, updateSearchParams } = useSearchURL();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterCount = useMemo(() => countActiveFilters(searchParams), [searchParams]);

  const activeTags = useMemo(() => getActiveFilterTags(searchParams), [searchParams]);

  const handleRemoveTag = (tagId: string) => {
    const tag = activeTags.find((t) => t.id === tagId);
    if (!tag) return;
    updateSearchParams(removeFilterTag(searchParams, tag));
  };

  return (
    <>
      <div className="relative border-b border-gray-200 bg-white md:sticky md:top-[var(--header-h)] md:z-40">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-gray-300 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
                {filterCount}
              </span>
            )}
          </button>

          {activeTags.length > 0 && (
            <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-2 md:flex">
              {activeTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground transition hover:border-gray-300 hover:bg-gray-100"
                  aria-label={`Remove filter: ${tag.label}`}
                >
                  <span className="truncate">{tag.label}</span>
                  <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Map className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Map view</span>
            <Switch checked={showMap} onCheckedChange={onMapToggle} aria-label="Toggle map view" />
          </div>
        </div>
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
}
