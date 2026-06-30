"use client";

import { useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { Plus, Tag, ToggleLeft } from "lucide-react";

import { addOnCategoryEnum } from "@/database/schema";
import { addOnSearchParams } from "@/features/add-ons/searchParams";
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
import { addOnCategoryLabel } from "@/features/add-ons/add-on.constants";
import { AddOnFormModal } from "@/features/add-ons/components/AddOnFormModal";
import type { AddOnCategory } from "@/features/add-ons/add-on.types";

export function AdminAddOnFilter() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useQueryStates(addOnSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const update = (updates: Partial<typeof filters>) => setFilters({ ...updates, page: 1 });

  const activeCount = useMemo(
    () => (filters.category ? 1 : 0) + (filters.active !== null ? 1 : 0),
    [filters.category, filters.active]
  );

  const clearAll = () =>
    setFilters({ search: "", category: null, active: null, page: 1 });

  const chips: FilterChipItem[] = [];
  if (filters.category) {
    chips.push({
      key: "category",
      label: `Category: ${addOnCategoryLabel(filters.category as AddOnCategory)}`,
      onRemove: () => update({ category: null }),
    });
  }
  if (filters.active !== null) {
    chips.push({
      key: "active",
      label: `Status: ${filters.active ? "Active" : "Inactive"}`,
      onRemove: () => update({ active: null }),
    });
  }

  return (
    <>
      <div className="space-y-2 pb-3">
        <AdminToolbar
          trailing={
            <Button size="sm" className="h-9 gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New add-on
            </Button>
          }
        >
          <FilterSearch
            value={filters.search}
            onChange={(v) => update({ search: v })}
            placeholder="Search add-ons..."
          />
          <FilterPopover activeCount={activeCount} onClearAll={clearAll}>
            <FilterField icon={Tag} label="Category">
              <FilterSelect<AddOnCategory>
                value={(filters.category as AddOnCategory) ?? null}
                onChange={(v) => update({ category: v })}
                options={addOnCategoryEnum.enumValues as readonly AddOnCategory[]}
                placeholder="Category"
                allLabel="Any category"
                width="w-full"
                renderLabel={addOnCategoryLabel}
              />
            </FilterField>
            <FilterField icon={ToggleLeft} label="Status">
              <FilterSelect
                value={
                  filters.active === true
                    ? "active"
                    : filters.active === false
                      ? "inactive"
                      : null
                }
                onChange={(v) =>
                  update({
                    active: v === "active" ? true : v === "inactive" ? false : null,
                  })
                }
                options={["active", "inactive"]}
                placeholder="Status"
                allLabel="Any status"
                width="w-full"
                renderLabel={(v) => (v === "active" ? "Active" : "Inactive")}
              />
            </FilterField>
          </FilterPopover>
        </AdminToolbar>

        <FilterChips chips={chips} onClearAll={clearAll} />
      </div>

      <AddOnFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
