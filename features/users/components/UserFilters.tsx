"use client";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search, X } from "lucide-react";
import { userStatusEnum, userRoleEnum } from "@/database/schema";
import { useDeferredValue, useMemo } from "react";

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
  const deferredSearch = useDeferredValue(filters.search);
  
  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const hasFilters = useMemo(() => {
    return filters.search || filters.status || filters.role;
  }, [filters.search, filters.status, filters.role]);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: null,
      role: null,
      page: 1,
    });
  };

  return (
    <div className="flex-shrink-0 border-b border-gray-200/70">
      <div className="px-6 py-3 bg-white">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by name, email, or username..."
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="pl-9 h-9 border-gray-200/70 focus:border-primary/50"
            />
          </div>

          {/* Role */}
          <Select
            value={filters.role || 'all'}
            onValueChange={(v) => updateFilter({ role: v === 'all' ? null : v })}
          >
            <SelectTrigger className="w-[120px] h-9 border-gray-200/70">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {userRoleEnum.enumValues.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => updateFilter({ status: v === 'all' ? null : v })}
          >
            <SelectTrigger className="w-[120px] h-9 border-gray-200/70">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {userStatusEnum.enumValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear */}
          {hasFilters && (
            <Button 
              onClick={clearFilters} 
              variant="ghost" 
              size="sm" 
              className="h-9 text-gray-600 hover:text-gray-900"
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
