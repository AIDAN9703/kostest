"use client";

import { useQueryStates } from "nuqs";
import { LayoutGrid } from "lucide-react";

import {
  bookingSearchParams,
  type BookingTypeFilter,
} from "@/features/bookings/searchParams";
import { DISPLAY_KINDS } from "@/features/bookings/deal-presentation";
import { cn } from "@/shared/lib/utils/general-utils";

interface BookingTypeStripProps {
  counts: Record<string, number>;
  total: number;
}

/**
 * The command strip — one colour-coded segment per deal kind with a live
 * count, each a one-click filter on bookingType. Kinds that present as one
 * (boat + general inquiries → "Inquiry") share a segment and a summed count.
 */
export function BookingTypeStrip({ counts, total }: BookingTypeStripProps) {
  const [filters, setFilters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const active = filters.bookingType;
  // Counts arrive already bucketed by display kind (stage-aware, server-side).
  const kinds = DISPLAY_KINDS.filter((k) => (counts[k.key] ?? 0) > 0);

  function select(key: BookingTypeFilter | null) {
    setFilters({ bookingType: active === key ? null : key, page: 1 });
  }

  return (
    // -m/p 1: breathing room INSIDE the scroll clip so the active ring isn't
    // sheared off at the top/left edge.
    <div className="-mx-1 -mt-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-3">
      {/* All */}
      <button
        type="button"
        onClick={() => select(null)}
        className={cn(
          "group flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
          active === null
            ? "border-primary bg-primary-soft/25 ring-1 ring-primary/50"
            : "border-border/60 bg-card hover:bg-muted/50"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-semibold leading-5 tabular-nums text-foreground">
            {total}
          </span>
          <span className="block whitespace-nowrap text-xs font-medium text-muted-foreground">
            All
          </span>
        </span>
      </button>

      {kinds.map(({ key, presentation: p }) => {
        const isActive = active === key;
        const Icon = p.Icon;
        return (
          <button
            key={key}
            type="button"
            onClick={() => select(key as BookingTypeFilter)}
            aria-pressed={isActive}
            className={cn(
              "group flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
              isActive
                ? "border-primary bg-primary-soft/25 ring-1 ring-primary/50"
                : "border-border/60 bg-card hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                p.iconWrap
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-5 tabular-nums text-foreground">
                {counts[key] ?? 0}
              </span>
              <span className="block whitespace-nowrap text-xs font-medium text-muted-foreground">
                {p.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
