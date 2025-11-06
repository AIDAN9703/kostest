"use client";

import React, { useDeferredValue, useMemo } from "react";
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
  Calendar,
  Ship,
  User,
  CreditCard,
} from "lucide-react";

interface BookingFiltersProps {
  filters: {
    search: string;
    bookingStatus: string | null;
    paymentStatus: string | null;
    bookingType: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    needsCaptain: boolean | null;
    minAmount: number | null;
    maxAmount: number | null;
    page: number;
  };
  setFilters: (filters: any) => void;
}

export function BookingFilters({ filters, setFilters }: BookingFiltersProps) {
  // Defer search value to avoid excessive updates
  const deferredSearch = useDeferredValue(filters.search);

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const activeAdvancedFilters = useMemo(() => {
    return [
      filters.dateFrom,
      filters.dateTo,
      filters.minAmount,
      filters.maxAmount,
      filters.needsCaptain,
    ].filter((v) => v !== undefined && v !== null).length;
  }, [filters]);

  const hasFilters = useMemo(() => {
    return (
      filters.search ||
      filters.bookingStatus ||
      filters.paymentStatus ||
      filters.bookingType ||
      activeAdvancedFilters > 0
    );
  }, [
    filters.search,
    filters.bookingStatus,
    filters.paymentStatus,
    filters.bookingType,
    activeAdvancedFilters,
  ]);

  const clearFilters = () => {
    setFilters({
      search: "",
      bookingStatus: null,
      paymentStatus: null,
      bookingType: null,
      dateFrom: null,
      dateTo: null,
      needsCaptain: null,
      minAmount: null,
      maxAmount: null,
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
              placeholder="Search by customer, boat, email, phone..."
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="pl-9 h-9 border-gray-200/70 focus:border-primary/50"
            />
          </div>

          {/* Booking Status */}
          <Select
            value={filters.bookingStatus || "all"}
            onValueChange={(v) =>
              updateFilter({ bookingStatus: v === "all" ? null : v })
            }
          >
            <SelectTrigger className="w-[140px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="DENIED">Denied</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status */}
          <Select
            value={filters.paymentStatus || "all"}
            onValueChange={(v) =>
              updateFilter({ paymentStatus: v === "all" ? null : v })
            }
          >
            <SelectTrigger className="w-[140px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="AWAITING_PAYMENT">Awaiting</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partial</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Booking Type */}
          <Select
            value={filters.bookingType || "all"}
            onValueChange={(v) =>
              updateFilter({ bookingType: v === "all" ? null : v })
            }
          >
            <SelectTrigger className="w-[130px] h-9 border-gray-200/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INSTANT_BOOK">Instant Book</SelectItem>
              <SelectItem value="REQUEST">Request</SelectItem>
              <SelectItem value="INQUIRY">Inquiry</SelectItem>
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

function AdvancedFiltersToggle({
  filters,
  updateFilter,
  activeCount,
}: {
  filters: BookingFiltersProps["filters"];
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

          <div className="absolute right-0 top-full mt-1 w-[500px] bg-white rounded-lg border border-gray-200/70 shadow-lg z-50">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Date Range */}
                <FilterGroup icon={Calendar} label="Date Range">
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.dateFrom ?? ""}
                      onChange={(e) =>
                        updateFilter({ dateFrom: e.target.value || null })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.dateTo ?? ""}
                      onChange={(e) =>
                        updateFilter({ dateTo: e.target.value || null })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>

                {/* Amount Range */}
                <FilterGroup icon={DollarSign} label="Amount Range">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minAmount: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxAmount: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>

                {/* Captain Required */}
                <FilterGroup icon={User} label="Captain">
                  <Select
                    value={
                      filters.needsCaptain === true
                        ? "yes"
                        : filters.needsCaptain === false
                          ? "no"
                          : "all"
                    }
                    onValueChange={(v) =>
                      updateFilter({
                        needsCaptain:
                          v === "yes" ? true : v === "no" ? false : null,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="yes">With Captain</SelectItem>
                      <SelectItem value="no">Self-Drive</SelectItem>
                    </SelectContent>
                  </Select>
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
        <Icon className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      {children}
    </div>
  );
}
