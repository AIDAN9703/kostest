"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface AdminToolbarProps {
  children: ReactNode;
  onClear: () => void;
  hasFilters: boolean;
  /** Optional count shown in the Clear chip (e.g. number of active filters). */
  activeCount?: number;
  /** Actions pinned to the right (e.g. create button, view toggle). */
  trailing?: ReactNode;
}

/**
 * Detached, rounded filter toolbar for admin list pages.
 * Drop-in replacement for the older <FilterBar> with a modern card look that
 * sits as a `shrink-0` sibling above the scrolling table in <AdminListShell>.
 */
export function AdminToolbar({
  children,
  onClear,
  hasFilters,
  activeCount,
  trailing,
}: AdminToolbarProps) {
  return (
    <div className="shrink-0 pb-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2.5 shadow-sm">
        {children}
        {trailing || hasFilters ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {trailing}
            {hasFilters ? (
              <Button
                onClick={onClear}
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear
                {activeCount && activeCount > 0 ? (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
