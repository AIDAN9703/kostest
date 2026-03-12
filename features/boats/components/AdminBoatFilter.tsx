"use client";

import React, { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { boatSearchParams } from "../searchParams";
import { boatCategoryEnum } from "@/database/schema";
import {
  SlidersHorizontal,
  DollarSign,
  Ruler,
  Users,
  Calendar,
  MapPin,
  Anchor,
  Home,
  Waves,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function AdminBoatFilter() {
  const [filters, setFilters] = useQueryStates(boatSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const activeAdvancedFilters = useMemo(() => {
    return [
      filters.minPrice,
      filters.maxPrice,
      filters.minLength,
      filters.maxLength,
      filters.minCapacity,
      filters.maxCapacity,
      filters.minYear,
      filters.maxYear,
      filters.minSleeps,
      filters.minBathrooms,
      filters.locationLabel,
      filters.crewRequired,
      filters.instantBook,
      filters.dayCharter,
      filters.termCharter,
    ].filter((v) => v !== undefined && v !== null).length;
  }, [filters]);

  const hasFilters = useMemo(() => {
    return (
      Boolean(filters.search) ||
      Boolean(filters.category) ||
      filters.featured !== null ||
      filters.active !== null ||
      activeAdvancedFilters > 0
    );
  }, [
    filters.search,
    filters.category,
    filters.featured,
    filters.active,
    activeAdvancedFilters,
  ]);

  const clearFilters = () => {
    setFilters({
      search: "",
      category: null,
      featured: null,
      active: null,
      minPrice: null,
      maxPrice: null,
      minLength: null,
      maxLength: null,
      minCapacity: null,
      maxCapacity: null,
      minYear: null,
      maxYear: null,
      minSleeps: null,
      minBathrooms: null,
      locationLabel: null,
      crewRequired: null,
      instantBook: null,
      dayCharter: null,
      termCharter: null,
      page: 1,
    });
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSearch
        value={filters.search}
        onChange={(v) => updateFilter({ search: v })}
        placeholder="Search by name, make, model, location, owner..."
      />
      <FilterSelect
        value={filters.category ?? null}
        onChange={(v) => updateFilter({ category: v })}
        options={boatCategoryEnum.enumValues}
        placeholder="Category"
        width="w-[140px]"
        renderLabel={(v) =>
          v
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        }
      />
      <FilterSelect
        value={
          filters.active === true
            ? "active"
            : filters.active === false
              ? "inactive"
              : null
        }
        onChange={(v) =>
          updateFilter({
            active: v === "active" ? true : v === "inactive" ? false : null,
          })
        }
        options={["active", "inactive"]}
        placeholder="Status"
        width="w-[110px]"
      />
      <FilterSelect
        value={
          filters.featured === true
            ? "yes"
            : filters.featured === false
              ? "no"
              : null
        }
        onChange={(v) =>
          updateFilter({
            featured: v === "yes" ? true : v === "no" ? false : null,
          })
        }
        options={["yes", "no"]}
        placeholder="Featured"
        width="w-[110px]"
      />
      <AdvancedFiltersToggle
        filters={filters}
        updateFilter={updateFilter}
        activeCount={activeAdvancedFilters}
      />
    </FilterBar>
  );
}

function AdvancedFiltersToggle({
  filters,
  updateFilter,
  activeCount,
}: {
  filters: ReturnType<typeof useQueryStates<typeof boatSearchParams>>[0];
  updateFilter: (updates: Partial<typeof filters>) => void;
  activeCount: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-1.5 border-border"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="text-sm">Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-[600px] bg-card rounded-lg border border-border shadow-lg z-50">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <FilterGroup icon={DollarSign} label="Price Range">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minPrice: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxPrice: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
                <FilterGroup icon={Ruler} label="Length (ft)">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minLength ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minLength: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxLength ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxLength: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
                <FilterGroup icon={Users} label="Capacity">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minCapacity ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minCapacity: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxCapacity ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxCapacity: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
                <FilterGroup icon={Calendar} label="Year Built">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="From"
                      value={filters.minYear ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minYear: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="To"
                      value={filters.maxYear ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxYear: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
                <FilterGroup icon={Home} label="Sleeps (Min)">
                  <Input
                    type="number"
                    placeholder="Minimum"
                    value={filters.minSleeps ?? ""}
                    onChange={(e) =>
                      updateFilter({
                        minSleeps: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="h-8 text-sm"
                  />
                </FilterGroup>
                <FilterGroup icon={Waves} label="Bathrooms (Min)">
                  <Input
                    type="number"
                    placeholder="Minimum"
                    value={filters.minBathrooms ?? ""}
                    onChange={(e) =>
                      updateFilter({
                        minBathrooms: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="h-8 text-sm"
                  />
                </FilterGroup>
                <FilterGroup icon={MapPin} label="Location">
                  <Input
                    placeholder="City or region..."
                    value={filters.locationLabel ?? ""}
                    onChange={(e) =>
                      updateFilter({ locationLabel: e.target.value || null })
                    }
                    className="h-8 text-sm"
                  />
                </FilterGroup>
                <FilterGroup icon={Anchor} label="Charter Options">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Crew
                      </label>
                      <Select
                        value={
                          filters.crewRequired === true
                            ? "yes"
                            : filters.crewRequired === false
                              ? "no"
                              : "all"
                        }
                        onValueChange={(v) =>
                          updateFilter({
                            crewRequired:
                              v === "yes" ? true : v === "no" ? false : null,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Required</SelectItem>
                          <SelectItem value="no">Not Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Instant Book
                      </label>
                      <Select
                        value={
                          filters.instantBook === true
                            ? "yes"
                            : filters.instantBook === false
                              ? "no"
                              : "all"
                        }
                        onValueChange={(v) =>
                          updateFilter({
                            instantBook:
                              v === "yes" ? true : v === "no" ? false : null,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Day Charter
                      </label>
                      <Select
                        value={
                          filters.dayCharter === true
                            ? "yes"
                            : filters.dayCharter === false
                              ? "no"
                              : "all"
                        }
                        onValueChange={(v) =>
                          updateFilter({
                            dayCharter:
                              v === "yes" ? true : v === "no" ? false : null,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Available</SelectItem>
                          <SelectItem value="no">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Term Charter
                      </label>
                      <Select
                        value={
                          filters.termCharter === true
                            ? "yes"
                            : filters.termCharter === false
                              ? "no"
                              : "all"
                        }
                        onValueChange={(v) =>
                          updateFilter({
                            termCharter:
                              v === "yes" ? true : v === "no" ? false : null,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any</SelectItem>
                          <SelectItem value="yes">Available</SelectItem>
                          <SelectItem value="no">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </FilterGroup>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}
