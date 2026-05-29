"use client";

import { useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Compass,
  CreditCard,
  DollarSign,
  Filter,
  LayoutList,
  MessageSquare,
  Plus,
  User,
  X,
} from "lucide-react";

import { AdminToolbar, FilterSearch } from "@/shared/admin/filters";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { bookingStatusEnum, bookingTypeEnum } from "@/database/schema";
import { PAYMENT_DISPLAY_STATUSES } from "@/shared/lib/utils/payment-display";
import { useThemeConfig } from "@/shared/admin/components/active-theme";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils/general-utils";

type AdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
};

/** Friendlier labels for raw enum values shown in selects + chips. */
const ENUM_LABEL_OVERRIDES: Record<string, string> = {
  REQUEST: "Request",
  INSTANT_BOOK: "Instant",
  EXTERNAL_BOOKING: "Admin-created",
  DEPOSIT_PAID: "Deposit paid",
};

function friendlyEnumLabel(value: string): string {
  return (
    ENUM_LABEL_OVERRIDES[value] ??
    value
      .toLowerCase()
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p))
      .join(" ")
  );
}

function getAdminLabel(admin: AdminOption | undefined): string {
  if (!admin) return "Unknown";
  const name = [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim();
  return name || admin.email || admin.username || "Unknown";
}

export function AdminBookingFilter({ admins }: { admins: AdminOption[] }) {
  const { activeTheme } = useThemeConfig();
  const [filters, setFilters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  /** Count of "real" filter axes applied (excludes search + ops toggle which are view tools). */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.bookingStatus != null) count += 1;
    if (filters.paymentStatus != null) count += 1;
    if (filters.bookingType != null) count += 1;
    if (filters.assignedAdminId != null) count += 1;
    if (filters.dateFrom || filters.dateTo) count += 1;
    if (filters.minAmount != null || filters.maxAmount != null) count += 1;
    if (filters.needsCaptain != null) count += 1;
    return count;
  }, [filters]);

  const hasAnyState = useMemo(
    () => Boolean(filters.search) || activeFilterCount > 0,
    [filters.search, activeFilterCount]
  );

  const clearAll = () => {
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
      page: 1,
    });
  };

  const findAdmin = (id: string) => admins.find((a) => a.id === id);

  return (
    <div className="shrink-0 space-y-2">
      <AdminToolbar
        onClear={clearAll}
        hasFilters={hasAnyState}
        activeCount={activeFilterCount > 0 ? activeFilterCount : undefined}
        trailing={
          <>
            <Button asChild size="sm" className="h-9 gap-1.5">
              <Link href="/admin/bookings/create">
                <Plus className="h-3.5 w-3.5" />
                New booking
              </Link>
            </Button>
            <div
              role="tablist"
              aria-label="Bookings view"
              className="inline-flex h-9 items-center rounded-md border border-border bg-muted/40 p-0.5"
            >
              <ViewToggleButton
                active={filters.view === "table"}
                label="Table"
                icon={LayoutList}
                onClick={() => updateFilter({ view: "table" })}
              />
              <ViewToggleButton
                active={filters.view === "calendar"}
                label="Calendar"
                icon={CalendarDays}
                onClick={() => updateFilter({ view: "calendar" })}
              />
            </div>
          </>
        }
      >
        <FilterSearch
          value={filters.search}
          onChange={(v) => updateFilter({ search: v })}
          placeholder="Search by customer, boat, email, phone..."
        />

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted/60 hover:text-foreground"
            >
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className={cn(
              "admin-theme w-[min(95vw,520px)] bg-popover p-0 text-popover-foreground",
              activeTheme && `theme-${activeTheme}`
            )}
          >
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FilterField icon={MessageSquare} label="Booking status">
                  <EnumSelect
                    value={filters.bookingStatus}
                    onChange={(v) => updateFilter({ bookingStatus: v })}
                    options={bookingStatusEnum.enumValues}
                    placeholder="Any status"
                  />
                </FilterField>
                <FilterField icon={CreditCard} label="Payment status">
                  <EnumSelect
                    value={filters.paymentStatus}
                    onChange={(v) => updateFilter({ paymentStatus: v })}
                    options={[...PAYMENT_DISPLAY_STATUSES]}
                    placeholder="Any payment"
                  />
                </FilterField>
                <FilterField icon={Compass} label="Booking type">
                  <EnumSelect
                    value={filters.bookingType}
                    onChange={(v) => updateFilter({ bookingType: v })}
                    options={bookingTypeEnum.enumValues}
                    placeholder="Any type"
                  />
                </FilterField>
                <FilterField icon={User} label="Assigned admin">
                  <AdminSelect
                    value={filters.assignedAdminId}
                    onChange={(v) => updateFilter({ assignedAdminId: v })}
                    admins={admins}
                  />
                </FilterField>
                <FilterField icon={CalendarIcon} label="Date range" className="sm:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.dateFrom ?? ""}
                      onChange={(e) => updateFilter({ dateFrom: e.target.value || null })}
                      className="h-9 text-sm"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo ?? ""}
                      onChange={(e) => updateFilter({ dateTo: e.target.value || null })}
                      className="h-9 text-sm"
                    />
                  </div>
                </FilterField>
                <FilterField icon={DollarSign} label="Amount">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={filters.minAmount ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          minAmount: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      className="h-9 text-sm"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={filters.maxAmount ?? ""}
                      onChange={(e) =>
                        updateFilter({
                          maxAmount: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                </FilterField>
                <FilterField icon={User} label="Captain need">
                  <Select
                    value={
                      filters.needsCaptain === true
                        ? "yes"
                        : filters.needsCaptain === false
                          ? "no"
                          : "any"
                    }
                    onValueChange={(v) =>
                      updateFilter({
                        needsCaptain: v === "yes" ? true : v === "no" ? false : null,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="yes">With captain</SelectItem>
                      <SelectItem value="no">Self-drive</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={!hasAnyState}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
              <Button size="sm" onClick={() => setPopoverOpen(false)} className="h-8">
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </AdminToolbar>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          {filters.bookingStatus && (
            <FilterChip
              label={`Status: ${friendlyEnumLabel(filters.bookingStatus)}`}
              onRemove={() => updateFilter({ bookingStatus: null })}
            />
          )}
          {filters.paymentStatus && (
            <FilterChip
              label={`Payment: ${friendlyEnumLabel(filters.paymentStatus)}`}
              onRemove={() => updateFilter({ paymentStatus: null })}
            />
          )}
          {filters.bookingType && (
            <FilterChip
              label={`Type: ${friendlyEnumLabel(filters.bookingType)}`}
              onRemove={() => updateFilter({ bookingType: null })}
            />
          )}
          {filters.assignedAdminId && (
            <FilterChip
              label={`Admin: ${getAdminLabel(findAdmin(filters.assignedAdminId))}`}
              onRemove={() => updateFilter({ assignedAdminId: null })}
            />
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <FilterChip
              label={`Date: ${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`}
              onRemove={() => updateFilter({ dateFrom: null, dateTo: null })}
            />
          )}
          {(filters.minAmount != null || filters.maxAmount != null) && (
            <FilterChip
              label={`Amount: $${filters.minAmount ?? 0}${
                filters.maxAmount != null ? ` – $${filters.maxAmount}` : "+"
              }`}
              onRemove={() => updateFilter({ minAmount: null, maxAmount: null })}
            />
          )}
          {filters.needsCaptain != null && (
            <FilterChip
              label={`Captain: ${filters.needsCaptain ? "With" : "Self-drive"}`}
              onRemove={() => updateFilter({ needsCaptain: null })}
            />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function ViewToggleButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
    >
      {label}
      <X className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
    </button>
  );
}

interface FilterFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FilterField({ icon: Icon, label, children, className }: FilterFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}

function EnumSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: readonly T[];
  placeholder: string;
}) {
  return (
    <Select value={value || "any"} onValueChange={(v) => onChange(v === "any" ? null : (v as T))}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {friendlyEnumLabel(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AdminSelect({
  value,
  onChange,
  admins,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  admins: AdminOption[];
}) {
  return (
    <Select value={value || "any"} onValueChange={(v) => onChange(v === "any" ? null : v)}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder="Any admin" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any admin</SelectItem>
        {admins.map((admin) => (
          <SelectItem key={admin.id} value={admin.id}>
            {getAdminLabel(admin)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
