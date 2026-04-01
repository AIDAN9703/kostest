"use client";

import React, { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { FilterBar, FilterSearch, FilterSelect } from "@/shared/admin/filters";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { bookingStatusEnum, bookingTypeEnum } from "@/database/schema";
import { PAYMENT_DISPLAY_STATUSES } from "@/shared/lib/utils/payment-display";
import { SlidersHorizontal, DollarSign, Calendar, User } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type AdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
};

export function AdminBookingFilter({ admins }: { admins: AdminOption[] }) {
  const [filters, setFilters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  const activeAdvancedFilters = useMemo(
    () =>
      [
        filters.dateFrom,
        filters.dateTo,
        filters.minAmount,
        filters.maxAmount,
        filters.needsCaptain,
      ].filter((v) => v !== undefined && v !== null).length,
    [filters]
  );

  const hasFilters = useMemo(
    () =>
      Boolean(filters.search) ||
      filters.bookingStatus != null ||
      filters.paymentStatus != null ||
      filters.bookingType != null ||
      filters.assignedAdminId != null ||
      filters.showOps ||
      activeAdvancedFilters > 0,
    [
      filters.search,
      filters.bookingStatus,
      filters.paymentStatus,
      filters.bookingType,
      filters.assignedAdminId,
      filters.showOps,
      activeAdvancedFilters,
    ]
  );

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
      assignedAdminId: null,
      showOps: false,
      page: 1,
    });
  };

  const adminOptions = useMemo(() => admins.map((a) => a.id), [admins]);

  const getAdminLabel = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return id;
    const name = [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim();
    return name || admin.email || admin.username || "Unknown";
  };

  return (
    <FilterBar onClear={clearFilters} hasFilters={hasFilters}>
      <FilterSearch
        value={filters.search}
        onChange={(v) => updateFilter({ search: v })}
        placeholder="Search by customer, boat, email, phone..."
      />
      <FilterSelect
        value={filters.bookingStatus}
        onChange={(v) => updateFilter({ bookingStatus: v })}
        options={bookingStatusEnum.enumValues}
        placeholder="Status"
        width="w-[140px]"
      />
      <FilterSelect
        value={filters.paymentStatus}
        onChange={(v) => updateFilter({ paymentStatus: v })}
        options={[...PAYMENT_DISPLAY_STATUSES]}
        placeholder="Payment"
        width="w-[150px]"
      />
      <FilterSelect
        value={filters.bookingType}
        onChange={(v) => updateFilter({ bookingType: v })}
        options={bookingTypeEnum.enumValues}
        placeholder="Type"
        width="w-[130px]"
      />
      <FilterSelect
        value={filters.assignedAdminId}
        onChange={(v) => updateFilter({ assignedAdminId: v })}
        options={adminOptions}
        placeholder="Admins"
        width="w-[180px]"
        renderLabel={getAdminLabel}
      />
      <AdvancedFiltersToggle
        filters={filters}
        updateFilter={updateFilter}
        activeCount={activeAdvancedFilters}
      />
      <div className="flex items-center gap-2">
        <Switch
          id="show-ops"
          checked={filters.showOps}
          onCheckedChange={(v) => updateFilter({ showOps: v })}
        />
        <Label htmlFor="show-ops" className="text-sm font-medium cursor-pointer">
          Show ops
        </Label>
      </div>
    </FilterBar>
  );
}

function AdvancedFiltersToggle({
  filters,
  updateFilter,
  activeCount,
}: {
  filters: ReturnType<typeof useQueryStates<typeof bookingSearchParams>>[0];
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-[500px] bg-card rounded-lg border border-border shadow-lg z-50">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <FilterGroup icon={Calendar} label="Date Range">
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateFrom ?? ""}
                      onChange={(e) => updateFilter({ dateFrom: e.target.value || null })}
                      className="h-8 text-sm"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo ?? ""}
                      onChange={(e) => updateFilter({ dateTo: e.target.value || null })}
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
                <FilterGroup icon={DollarSign} label="Amount Range">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minAmount: e.target.value ? parseInt(e.target.value, 10) : null,
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
                          maxAmount: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </FilterGroup>
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
                        needsCaptain: v === "yes" ? true : v === "no" ? false : null,
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
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}
