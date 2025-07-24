"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { boatCategoryEnum } from "@/database/schema";
import type { BoatFilterInput } from "@/features-admin/_validation/boats";

interface BoatsFilterBarProps {
  currentFilters: BoatFilterInput;
}

export function BoatsFilterBar({ currentFilters }: BoatsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for immediate UI updates
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchValue, 500);
  
  // Update URL when filters change
  const updateFilters = useCallback((updates: Partial<BoatFilterInput>) => {
    const params = new URLSearchParams(searchParams);
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    // Reset to page 1 when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.delete('page');
    }
    
    router.push(`/admin/boats?${params.toString()}`);
  }, [router, searchParams]);
  
  // Sync debounced search with URL
  useEffect(() => {
    if (debouncedSearch !== currentFilters.search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, currentFilters.search, updateFilters]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchValue("");
    router.push("/admin/boats");
  };
  
  // Count active filters
  const activeFilterCount = [
    currentFilters.search,
    currentFilters.category,
    currentFilters.featured,
    currentFilters.active,
  ].filter(Boolean).length;
  
  return (
    <div className="space-y-4 bg-white rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search boats by name, make, model, or location..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Category Filter */}
        <Select
          value={currentFilters.category || "all"}
          onValueChange={(value) => 
            updateFilters({ 
              category: value === "all" ? undefined : value as typeof boatCategoryEnum.enumValues[number]
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {boatCategoryEnum.enumValues.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Status Filters */}
        <div className="flex gap-2">
          <Button
            variant={currentFilters.active === true ? "default" : "outline"}
            size="sm"
            onClick={() => 
              updateFilters({ 
                active: currentFilters.active === true ? undefined : true 
              })
            }
          >
            Active Only
          </Button>
          
          <Button
            variant={currentFilters.featured === true ? "default" : "outline"}
            size="sm"
            onClick={() => 
              updateFilters({ 
                featured: currentFilters.featured === true ? undefined : true 
              })
            }
          >
            Featured Only
          </Button>
        </div>
        
        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
      
      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{currentFilters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSearchValue("");
                  updateFilters({ search: undefined });
                }}
              />
            </Badge>
          )}
          
          {currentFilters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {currentFilters.category.replace('_', ' ')}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ category: undefined })}
              />
            </Badge>
          )}
          
          {currentFilters.active === true && (
            <Badge variant="secondary" className="gap-1">
              Active Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ active: undefined })}
              />
            </Badge>
          )}
          
          {currentFilters.featured === true && (
            <Badge variant="secondary" className="gap-1">
              Featured Only
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ featured: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 