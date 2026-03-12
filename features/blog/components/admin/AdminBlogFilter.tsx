"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { blogSearchParams } from "@/features/blog/searchParams";
import { postCategoryEnum, postStatusEnum } from "@/database/schema";

const categoryLabels: Record<string, string> = {
  FLEET_NEWS: "Fleet News",
  CONSERVATION: "Conservation",
  TIPS_ADVICE: "Tips & Advice",
  CASE_STUDY: "Case Study",
  COMPANY_NEWS: "Company News",
  SAFETY: "Safety",
  EVENTS: "Events",
};

export function AdminBlogFilter() {
  const [filters, setFilters] = useQueryStates(blogSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(
    () =>
      Boolean(
        filters.search ||
          filters.status ||
          filters.category ||
          filters.featured !== null,
      ),
    [filters.search, filters.status, filters.category, filters.featured],
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      status: null,
      category: null,
      featured: null,
      page: 1,
    });
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSearch
        value={filters.search}
        onChange={(v) => updateFilter({ search: v })}
        placeholder="Search posts..."
      />
      <FilterSelect
        value={filters.status}
        onChange={(v) => updateFilter({ status: v })}
        options={postStatusEnum.enumValues}
        placeholder="Status"
        width="w-[140px]"
        renderLabel={(v) =>
          v === "DRAFT"
            ? "Draft"
            : v === "PUBLISHED"
              ? "Published"
              : v === "ARCHIVED"
                ? "Archived"
                : v === "SCHEDULED"
                  ? "Scheduled"
                  : v
        }
      />
      <FilterSelect
        value={filters.category}
        onChange={(v) => updateFilter({ category: v })}
        options={postCategoryEnum.enumValues}
        placeholder="Category"
        width="w-[160px]"
        renderLabel={(v) => categoryLabels[v] ?? v.replace(/_/g, " ")}
      />
      <FilterSelect
        value={
          filters.featured === true
            ? "true"
            : filters.featured === false
              ? "false"
              : null
        }
        onChange={(v) =>
          updateFilter({
            featured: v === "true" ? true : v === "false" ? false : null,
          })
        }
        options={["true", "false"] as const}
        placeholder="Featured"
        width="w-[120px]"
        renderLabel={(v) => (v === "true" ? "Featured" : "Not featured")}
      />
    </FilterBar>
  );
}
