"use client";

import React from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  Search, 
  X, 
  SlidersHorizontal,
  DollarSign,
  Ruler,
  Users,
  Calendar,
  MapPin,
  Anchor,
  Home,
  Waves
} from "lucide-react";
import { boatCategoryEnum } from "@/database/schema";
import { useDeferredValue, useMemo } from "react";

interface BoatFiltersProps {
  filters: {
    search: string;
    category: string;
    featured: boolean | null;
    active: boolean | null;
    minPrice: number | null;
    maxPrice: number | null;
    minLength: number | null;
    maxLength: number | null;
    minCapacity: number | null;
    maxCapacity: number | null;
    minYear: number | null;
    maxYear: number | null;
    minSleeps: number | null;
    minBathrooms: number | null;
    locationLabel: string | null;
    crewRequired: boolean | null;
    instantBook: boolean | null;
    dayCharter: boolean | null;
    termCharter: boolean | null;
    page: number;
  };
  setFilters: (filters: any) => void;
}

export function BoatFilters({ filters, setFilters }: BoatFiltersProps) {
  // Defer search value to avoid excessive updates
  const deferredSearch = useDeferredValue(filters.search);
  
  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const activeAdvancedFilters = useMemo(() => {
    return [
      filters.minPrice, filters.maxPrice, filters.minLength, filters.maxLength,
      filters.minCapacity, filters.maxCapacity, filters.minYear, filters.maxYear,
      filters.minSleeps, filters.minBathrooms, filters.locationLabel,
      filters.crewRequired, filters.instantBook, filters.dayCharter, filters.termCharter,
    ].filter(v => v !== undefined && v !== null).length;
  }, [filters]);

  const hasFilters = useMemo(() => {
    return filters.search || filters.category || filters.featured !== null || 
      filters.active !== null || activeAdvancedFilters > 0;
  }, [filters.search, filters.category, filters.featured, filters.active, activeAdvancedFilters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
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
    <div className="flex-shrink-0 border-b border-gray-200/70">
      {/* Main Filter Bar */}
      <div className="px-6 py-3 bg-white">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by name, make, model, location, owner"
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="pl-9 h-9 border-gray-200/70 focus:border-primary/50"
            />
          </div>

          {/* Category */}
          <Select 
            value={filters.category || 'all'} 
            onValueChange={(v) => updateFilter({ category: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-[140px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {boatCategoryEnum.enumValues.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.active === true ? 'active' : filters.active === false ? 'inactive' : 'all'}
            onValueChange={(v) => updateFilter({ active: v === 'active' ? true : v === 'inactive' ? false : undefined })}
          >
            <SelectTrigger className="w-[110px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Featured */}
          <Select
            value={filters.featured === true ? 'yes' : filters.featured === false ? 'no' : 'all'}
            onValueChange={(v) => updateFilter({ featured: v === 'yes' ? true : v === 'no' ? false : undefined })}
          >
            <SelectTrigger className="w-[110px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Featured</SelectItem>
              <SelectItem value="no">Not Featured</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <AdvancedFiltersToggle 
            filters={filters}
            updateFilter={updateFilter}
            activeCount={activeAdvancedFilters}
          />

          {/* Clear */}
          {hasFilters && (
            <Button 
              onClick={clearFilters} 
              variant="ghost" 
              size="sm" 
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdvancedFiltersToggle({ filters, updateFilter, activeCount }: {
  filters: BoatFiltersProps['filters'];
  updateFilter: (updates: any) => void;
  activeCount: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-1.5 border-gray-200/70"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="text-sm">Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-white rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-1 w-[600px] bg-white rounded-lg border border-gray-200/70 shadow-lg z-50">
            <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Price Range */}
            <FilterGroup icon={DollarSign} label="Price Range">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => updateFilter({ minPrice: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => updateFilter({ maxPrice: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
              </div>
            </FilterGroup>

            {/* Length */}
            <FilterGroup icon={Ruler} label="Length (ft)">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minLength ?? ''}
                  onChange={(e) => updateFilter({ minLength: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxLength ?? ''}
                  onChange={(e) => updateFilter({ maxLength: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
              </div>
            </FilterGroup>

            {/* Capacity */}
            <FilterGroup icon={Users} label="Capacity">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minCapacity ?? ''}
                  onChange={(e) => updateFilter({ minCapacity: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxCapacity ?? ''}
                  onChange={(e) => updateFilter({ maxCapacity: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
              </div>
            </FilterGroup>

            {/* Year Built */}
            <FilterGroup icon={Calendar} label="Year Built">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={filters.minYear ?? ''}
                  onChange={(e) => updateFilter({ minYear: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="To"
                  value={filters.maxYear ?? ''}
                  onChange={(e) => updateFilter({ maxYear: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-8 text-sm"
                />
              </div>
            </FilterGroup>

            {/* Sleeps */}
            <FilterGroup icon={Home} label="Sleeps (Min)">
              <Input
                type="number"
                placeholder="Minimum"
                value={filters.minSleeps ?? ''}
                onChange={(e) => updateFilter({ minSleeps: e.target.value ? parseInt(e.target.value) : null })}
                className="h-8 text-sm"
              />
            </FilterGroup>

            {/* Bathrooms */}
            <FilterGroup icon={Waves} label="Bathrooms (Min)">
              <Input
                type="number"
                placeholder="Minimum"
                value={filters.minBathrooms ?? ''}
                onChange={(e) => updateFilter({ minBathrooms: e.target.value ? parseInt(e.target.value) : null })}
                className="h-8 text-sm"
              />
            </FilterGroup>

            {/* Location */}
            <FilterGroup icon={MapPin} label="Location">
              <Input
                placeholder="City or region..."
                value={filters.locationLabel ?? ''}
                onChange={(e) => updateFilter({ locationLabel: e.target.value || null })}
                className="h-8 text-sm"
              />
            </FilterGroup>

            {/* Charter Options */}
            <FilterGroup icon={Anchor} label="Charter Options">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Crew</label>
                  <Select
                    value={filters.crewRequired === true ? 'yes' : filters.crewRequired === false ? 'no' : 'all'}
                    onValueChange={(v) => updateFilter({ crewRequired: v === 'yes' ? true : v === 'no' ? false : null })}
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
                  <label className="text-xs text-gray-600 mb-1 block">Booking Type</label>
                  <Select
                    value={filters.instantBook === true ? 'yes' : filters.instantBook === false ? 'no' : 'all'}
                    onValueChange={(v) => updateFilter({ instantBook: v === 'yes' ? true : v === 'no' ? false : null })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">Instant Book</SelectItem>
                      <SelectItem value="no">Request Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Day Charter</label>
                  <Select
                    value={filters.dayCharter === true ? 'yes' : filters.dayCharter === false ? 'no' : 'all'}
                    onValueChange={(v) => updateFilter({ dayCharter: v === 'yes' ? true : v === 'no' ? false : null })}
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
                  <label className="text-xs text-gray-600 mb-1 block">Term Charter</label>
                  <Select
                    value={filters.termCharter === true ? 'yes' : filters.termCharter === false ? 'no' : 'all'}
                    onValueChange={(v) => updateFilter({ termCharter: v === 'yes' ? true : v === 'no' ? false : null })}
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

function FilterGroup({ icon: Icon, label, children }: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      {children}
    </div>
  );
}
