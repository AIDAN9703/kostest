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

const OUTCOME_FILTERS: { value: InquiryOutcome | null; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "ABANDONED", label: "Archived" },
  { value: null, label: "All" },
];

/**
 * Manifest toolbar: underline scope tabs (ownership) on the ink rule,
 * mono outcome filters at right, underline search beneath.
 */
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
    <div>
      {/* Scope tabs on the ink rule + outcome filters */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 border-b-2 border-foreground">
        <nav className="-mb-0.5 flex items-end gap-0.5" aria-label="Lead ownership">
          {SCOPE_TABS.map((tab) => {
            const active = filters.scope === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setFilters({ scope: tab.value, page: 1 })}
                className={cn(
                  "border-b-2 px-3.5 pb-2.5 pt-1 text-sm transition-colors",
                  active
                    ? "border-foreground font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 pb-2.5 font-mono text-[11px] uppercase tracking-wider">
          {OUTCOME_FILTERS.map((f) => {
            const active = filters.outcome === f.value;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilters({ outcome: f.value, page: 1 })}
                className={cn(
                  "transition-colors",
                  active
                    ? "font-semibold text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Underline search */}
      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search the manifest — name, email, phone"
          className="h-9 w-full border-0 border-b border-border bg-transparent pl-6 pr-8 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
