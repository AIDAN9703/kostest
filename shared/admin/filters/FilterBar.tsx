"use client";

import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  children: React.ReactNode;
  onClear: () => void;
  hasFilters: boolean;
}

/**
 * Shared filter bar layout with consistent styling and clear button.
 * Used across admin list pages (e.g. inquiries).
 */
export function FilterBar({ children, onClear, hasFilters }: FilterBarProps) {
  return (
    <div className="shrink-0 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        {children}

        {hasFilters ? (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}

