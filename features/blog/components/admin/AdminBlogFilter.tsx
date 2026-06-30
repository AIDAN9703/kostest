"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { FileText, Plus, Star, Tag } from "lucide-react";
import {
  AdminToolbar,
  FilterChips,
  FilterField,
  FilterPopover,
  FilterSearch,
  FilterSelect,
  type FilterChipItem,
} from "@/shared/admin/filters";
import { Button } from "@/shared/components/ui/button";
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

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  SCHEDULED: "Scheduled",
};

const categoryLabel = (v: string) => categoryLabels[v] ?? v.replace(/_/g, " ");
const statusLabel = (v: string) => statusLabels[v] ?? v;

export function AdminBlogFilter() {
  const [filters, setFilters] = useQueryStates(blogSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const activeCount = useMemo(
    () =>
      (filters.status ? 1 : 0) +
      (filters.category ? 1 : 0) +
      (filters.featured !== null ? 1 : 0),
    [filters.status, filters.category, filters.featured]
  );

  const clearAll = () => {
    setFilters({
      search: "",
      status: null,
      category: null,
      featured: null,
      page: 1,
    });
  };

  const chips: FilterChipItem[] = [];
  if (filters.status) {
    chips.push({
      key: "status",
      label: `Status: ${statusLabel(filters.status)}`,
      onRemove: () => updateFilter({ status: null }),
    });
  }
  if (filters.category) {
    chips.push({
      key: "category",
      label: `Category: ${categoryLabel(filters.category)}`,
      onRemove: () => updateFilter({ category: null }),
    });
  }
  if (filters.featured !== null) {
    chips.push({
      key: "featured",
      label: filters.featured ? "Featured" : "Not featured",
      onRemove: () => updateFilter({ featured: null }),
    });
  }

  return (
    <div className="space-y-2 pb-3">
      <AdminToolbar
        trailing={
          <Button asChild size="sm" className="h-9 gap-1.5">
            <Link href="/admin/blog/create">
              <Plus className="h-3.5 w-3.5" />
              New post
            </Link>
          </Button>
        }
      >
        <FilterSearch
          value={filters.search}
          onChange={(v) => updateFilter({ search: v })}
          placeholder="Search posts..."
        />
        <FilterPopover activeCount={activeCount} onClearAll={clearAll}>
          <FilterField icon={FileText} label="Status">
            <FilterSelect
              value={filters.status}
              onChange={(v) => updateFilter({ status: v })}
              options={postStatusEnum.enumValues}
              placeholder="Status"
              allLabel="Any status"
              width="w-full"
              renderLabel={statusLabel}
            />
          </FilterField>
          <FilterField icon={Tag} label="Category">
            <FilterSelect
              value={filters.category}
              onChange={(v) => updateFilter({ category: v })}
              options={postCategoryEnum.enumValues}
              placeholder="Category"
              allLabel="Any category"
              width="w-full"
              renderLabel={categoryLabel}
            />
          </FilterField>
          <FilterField icon={Star} label="Featured" className="sm:col-span-2">
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
              allLabel="Any"
              width="w-full"
              renderLabel={(v) => (v === "true" ? "Featured" : "Not featured")}
            />
          </FilterField>
        </FilterPopover>
      </AdminToolbar>

      <FilterChips chips={chips} onClearAll={clearAll} />
    </div>
  );
}
