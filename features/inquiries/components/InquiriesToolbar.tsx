"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryStates } from "nuqs";
import { Search, X } from "lucide-react";

import { inquirySearchParams } from "../searchParams";
import { cn } from "@/shared/lib/utils/general-utils";
import type { InquiryOutcome } from "@/database/schema";

const OUTCOME_TABS: { value: InquiryOutcome | null; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "LOST", label: "Lost" },
  { value: "ABANDONED", label: "Archived" },
  { value: null, label: "All" },
];

/** Search + outcome quick-filters, synced to the URL. Template toolbar for admin list pages. */
export function InquiriesToolbar() {
  const [filters, setFilters] = useQueryStates(inquirySearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  // Local input state, debounced into the URL so we don't refetch per keystroke.
  const [searchValue, setSearchValue] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  function onSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value || "", page: 1 });
    }, 300);
  }

  function clearSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchValue("");
    setFilters({ search: "", page: 1 });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="h-9 w-full rounded-full border-0 bg-muted pl-10 pr-9 text-sm outline-none ring-0 transition-shadow placeholder:text-muted-foreground focus:bg-background focus:shadow-sm focus:ring-1 focus:ring-border"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {/* Outcome tabs */}
      <div className="flex items-center rounded-full bg-muted p-0.5">
        {OUTCOME_TABS.map((tab) => {
          const active = filters.outcome === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setFilters({ outcome: tab.value, page: 1 })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
