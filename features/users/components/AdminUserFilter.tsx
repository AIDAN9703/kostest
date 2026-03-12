"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { userSearchParams } from "../searchParams";
import { userStatusEnum } from "@/database/schema";
import { Checkbox } from "@/shared/components/ui/checkbox";

export function AdminUserFilter() {
  const [filters, setFilters] = useQueryStates(userSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(
    () => Boolean(filters.search || filters.status || filters.isAdmin !== null),
    [filters.search, filters.status, filters.isAdmin],
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      status: null,
      isAdmin: null,
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="admin-filter"
          checked={filters.isAdmin === true}
          onCheckedChange={(checked) =>
            updateFilter({ isAdmin: checked ? true : null })
          }
        />
        <label
          htmlFor="admin-filter"
          className="text-sm text-foreground cursor-pointer"
        >
          Admins only
        </label>
      </div>
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
