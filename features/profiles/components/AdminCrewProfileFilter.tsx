"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { crewProfileListSearchParams } from "../crew-profile.search-params";
import { crewStatusEnum } from "@/database/schema";

export function AdminCrewProfileFilter() {
  const [filters, setFilters] = useQueryStates(crewProfileListSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(
    () => Boolean(filters.search || filters.status),
    [filters.search, filters.status]
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      status: null,
      page: 1,
    });
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSearch
        value={filters.search}
        onChange={(v) => updateFilter({ search: v })}
        placeholder="Search by name, email, or username..."
      />
      <FilterSelect
        value={filters.status}
        onChange={(v) => updateFilter({ status: v })}
        options={crewStatusEnum.enumValues}
        placeholder="Status"
        width="w-[160px]"
      />
    </FilterBar>
  );
}
