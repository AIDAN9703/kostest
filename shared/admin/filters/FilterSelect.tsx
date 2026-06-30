"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface FilterSelectProps<T extends string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[];
  placeholder: string;
  renderLabel?: (value: T) => string;
  width?: string;
  /** Label for the "no filter" option. Defaults to `All {placeholder}`. */
  allLabel?: string;
}

/**
 * Shared select filter with a consistent "all" option.
 * Generic, type-safe implementation for enum filters. Use `width="w-full"` and
 * `allLabel="Any"` inside a <FilterField> within <FilterPopover>.
 */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  renderLabel,
  width = "w-[140px]",
  allLabel,
}: FilterSelectProps<T>) {
  const formatLabel =
    renderLabel ||
    ((v: T) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " "));

  return (
    <Select
      value={value || "all"}
      onValueChange={(v) => onChange(v === "all" ? null : (v as T))}
    >
      <SelectTrigger className={`${width} h-9 border-border`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel ?? `All ${placeholder}`}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {formatLabel(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
