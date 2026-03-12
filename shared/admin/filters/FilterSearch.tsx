"use client";

import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Shared search input for admin filters
 * Consistent styling and icon placement
 */
export function FilterSearch({ value, onChange, placeholder }: FilterSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 border-border focus:border-primary/50"
      />
    </div>
  );
}

