"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryStates } from "nuqs";
import { Search, X } from "lucide-react";

import { inquirySearchParams } from "../searchParams";
import { cn } from "@/shared/lib/utils/general-utils";
import type { InquiryOutcome } from "@/database/schema";

const SCOPE_TABS: { value: "mine" | "unassigned" | null; label: string }[] = [
  { value: null, label: "All leads" },
  { value: "mine", label: "My leads" },
  { value: "unassigned", label: "Unassigned" },
];

const OUTCOME_TABS: { value: InquiryOutcome | null; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ABANDONED", label: "Archived" },
  { value: null, label: "All" },
];

/** Scope + outcome segmented pills with a rounded search — the template toolbar. */
export function InquiriesToolbar() {
  const [filters, setFilters] = useQueryStates(inquirySearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

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
    /* One row, one height (h-10), left-aligned: search · scope · outcome */
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative h-10 w-full sm:w-64 lg:w-72">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="h-10 w-full rounded-full border-0 bg-muted pl-10 pr-9 text-sm outline-none transition-all placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:ring-1 focus:ring-border"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {/* Scope */}
      <div className="flex h-10 items-center rounded-full bg-muted p-1">
        {SCOPE_TABS.map((tab) => {
          const active = filters.scope === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setFilters({ scope: tab.value, page: 1 })}
              className={cn(
                "flex h-8 items-center rounded-full px-4 text-sm font-medium transition-all",
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

      {/* Outcome */}
      <div className="flex h-10 items-center rounded-full bg-muted p-1">
        {OUTCOME_TABS.map((tab) => {
          const active = filters.outcome === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setFilters({ outcome: tab.value, page: 1 })}
              className={cn(
                "flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-all",
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
