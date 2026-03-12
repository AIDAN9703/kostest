"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSelect } from "@/shared/admin/filters";
import { inquirySearchParams } from "../searchParams";
import { inquiryStageEnum, inquiryOutcomeEnum } from "@/database/schema";

const formatLabel = (v: string) =>
  v
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function AdminInquiryFilter() {
  const [filters, setFilters] = useQueryStates(inquirySearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(
    () => Boolean(filters.stage || filters.outcome),
    [filters.stage, filters.outcome],
  );

  const clearFilters = () => {
    setFilters({
      stage: null,
      outcome: null,
      page: 1,
    });
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSelect
        value={filters.stage}
        onChange={(v) => updateFilter({ stage: v })}
        options={inquiryStageEnum.enumValues}
        placeholder="Stage"
        width="w-[140px]"
        renderLabel={formatLabel}
      />
      <FilterSelect
        value={filters.outcome}
        onChange={(v) => updateFilter({ outcome: v })}
        options={inquiryOutcomeEnum.enumValues}
        placeholder="Outcome"
        width="w-[120px]"
        renderLabel={formatLabel}
      />
    </FilterBar>
  );
}
