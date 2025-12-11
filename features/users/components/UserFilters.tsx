"use client";

import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { userStatusEnum, userRoleEnum } from "@/database/schema";
import { useMemo } from "react";

interface UserFiltersProps {
  filters: {
    search: string;
    status: string | null;
    role: string | null;
    page: number;
  };
  setFilters: (filters: any) => void;
}

export function UserFilters({ filters, setFilters }: UserFiltersProps) {
  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(
    () => Boolean(filters.search || filters.status || filters.role),
    [filters.search, filters.status, filters.role]
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      status: null,
      role: null,
      page: 1,
    });
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSearch
        value={filters.search}
        onChange={(v) => updateFilter({ search: v })}
        placeholder="Search by name, emai, or username..."
      />
      <FilterSelect
        value={filters.role}
        onChange={(v) => updateFilter({ role: v })}
        options={userRoleEnum.enumValues}
        placeholder="Role"
        width="w-[120px]"
      />
      <FilterSelect
        value={filters.status}
        onChange={(v) => updateFilter({ status: v })}
        options={userStatusEnum.enumValues}
        placeholder="Status"
        width="w-[120px]"
      />
    </FilterBar>
  );
}
