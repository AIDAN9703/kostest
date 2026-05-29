"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { crewProfileListSearchParams } from "../crew-profile.search-params";
import { crewStatusEnum } from "@/database/schema";

export function AdminCrewProfileFilter() {
  const [filters, setFilters] = useQueryStates(crewProfileListSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const hasFilters = useMemo(
    () => Boolean(filters.search || filters.status),
    [filters.search, filters.status]
  );

  const clearFilters = () => {
    setFilters({ search: "", status: null });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSearch
        value={filters.search}
        onChange={(v) => setFilters({ search: v })}
        placeholder="Search by name, email, phone, or notes…"
      />
      <FilterSelect
        value={filters.status}
        onChange={(v) => setFilters({ status: v })}
        options={crewStatusEnum.enumValues}
        placeholder="Status"
        width="w-[160px]"
      />
      {hasFilters ? (
        <Button
          onClick={clearFilters}
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
