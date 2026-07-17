"use client";

import { Search } from "lucide-react";

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Shared search input for admin filters — the rounded-full pill style used
 * by the inquiries toolbar, so every admin list reads the same.
 */
export function FilterSearch({ value, onChange, placeholder }: FilterSearchProps) {
  return (
    <div className="relative h-10 w-full max-w-md flex-1 sm:w-64 lg:w-72">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-full border-0 bg-muted pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:ring-1 focus:ring-border"
      />
    </div>
  );
}

