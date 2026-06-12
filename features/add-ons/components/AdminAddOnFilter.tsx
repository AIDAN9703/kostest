"use client";

import { useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { Plus } from "lucide-react";

import { addOnCategoryEnum } from "@/database/schema";
import { addOnSearchParams } from "@/features/add-ons/searchParams";
import { AdminToolbar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
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
    () =>
      [filters.search, filters.category, filters.active].filter(
        (v) => v !== null && v !== undefined && v !== ""
      ).length,
    [filters.search, filters.category, filters.active]
  );

  const clearAll = () =>
    setFilters({ search: "", category: null, active: null, page: 1 });

  return (
    <>
      <AdminToolbar
        onClear={clearAll}
        hasFilters={activeCount > 0}
        activeCount={activeCount > 0 ? activeCount : undefined}
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
        <FilterSelect<AddOnCategory>
          value={(filters.category as AddOnCategory) ?? null}
          onChange={(v) => update({ category: v })}
          options={addOnCategoryEnum.enumValues as readonly AddOnCategory[]}
          placeholder="Category"
          renderLabel={addOnCategoryLabel}
          width="w-[170px]"
        />
      </AdminToolbar>

      <AddOnFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
