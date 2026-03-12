"use client";

import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  children: React.ReactNode;
  onClear: () => void;
  hasFilters: boolean;
}

/**
 * Shared filter bar layout with consistent styling and clear button
 * Used across all admin list pages for consistency
 */
export function FilterBar({ children, onClear, hasFilters }: FilterBarProps) {
  return (
    <div className="flex-shrink-0 border-b border-border">
      <div className="px-6 py-3 bg-card">
        <div className="flex items-center gap-2">
          {children}
          
          {/* Clear Filters Button */}
          {hasFilters && (
            <Button 
              onClick={onClear} 
              variant="ghost" 
              size="sm" 
              className="h-9 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

