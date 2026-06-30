"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Compass,
  CreditCard,
  DollarSign,
  LayoutList,
  MessageSquare,
  User,
} from "lucide-react";

import {
  AdminToolbar,
  FilterChips,
  FilterField,
  FilterPopover,
  FilterSearch,
  FilterSelect,
  type FilterChipItem,
} from "@/shared/admin/filters";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { bookingStatusEnum, bookingTypeEnum } from "@/database/schema";
import { PAYMENT_DISPLAY_STATUSES } from "@/shared/lib/utils/payment-display";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils/general-utils";
import { NewBookingModal } from "@/features/bookings/components/admin/new-booking-modal";
import type { PricingTierOption } from "@/features/bookings/components/admin/booking-forms/types";

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

export function AdminBookingFilter({
  admins,
  pricingTiers,
}: {
  admins: AdminOption[];
  pricingTiers: PricingTierOption[];
}) {
  const [filters, setFilters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const updateFilter = (updates: Partial<typeof filters>) => {
    setFilters({ ...updates, page: 1 });
  };

  /** Count of "real" filter axes applied (excludes search + view which are view tools). */
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
  const adminIds = useMemo(() => admins.map((a) => a.id), [admins]);

  const chips: FilterChipItem[] = [];
  if (filters.bookingStatus)
    chips.push({
      key: "status",
      label: `Status: ${friendlyEnumLabel(filters.bookingStatus)}`,
      onRemove: () => updateFilter({ bookingStatus: null }),
    });
  if (filters.paymentStatus)
    chips.push({
      key: "payment",
      label: `Payment: ${friendlyEnumLabel(filters.paymentStatus)}`,
      onRemove: () => updateFilter({ paymentStatus: null }),
    });
  if (filters.bookingType)
    chips.push({
      key: "type",
      label: `Type: ${friendlyEnumLabel(filters.bookingType)}`,
      onRemove: () => updateFilter({ bookingType: null }),
    });
  if (filters.assignedAdminId)
    chips.push({
      key: "admin",
      label: `Admin: ${getAdminLabel(findAdmin(filters.assignedAdminId))}`,
      onRemove: () => updateFilter({ assignedAdminId: null }),
    });
  if (filters.dateFrom || filters.dateTo)
    chips.push({
      key: "date",
      label: `Date: ${filters.dateFrom || "…"} → ${filters.dateTo || "…"}`,
      onRemove: () => updateFilter({ dateFrom: null, dateTo: null }),
    });
  if (filters.minAmount != null || filters.maxAmount != null)
    chips.push({
      key: "amount",
      label: `Amount: $${filters.minAmount ?? 0}${
        filters.maxAmount != null ? ` – $${filters.maxAmount}` : "+"
      }`,
      onRemove: () => updateFilter({ minAmount: null, maxAmount: null }),
    });
  if (filters.needsCaptain != null)
    chips.push({
      key: "captain",
      label: `Captain: ${filters.needsCaptain ? "With" : "Self-drive"}`,
      onRemove: () => updateFilter({ needsCaptain: null }),
    });

  return (
    <div className="space-y-2 pb-3">
      <AdminToolbar
        trailing={
          <>
            <NewBookingModal
              pricingTiers={pricingTiers}
              triggerLabel="Add booking"
              defaultOpen={filters.newBooking === true}
              onCloseComplete={() => {
                if (filters.newBooking) {
                  setFilters({ newBooking: null });
                }
              }}
            />
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
        <FilterPopover activeCount={activeFilterCount} onClearAll={clearAll}>
          <FilterField icon={MessageSquare} label="Booking status">
            <FilterSelect
              value={filters.bookingStatus}
              onChange={(v) => updateFilter({ bookingStatus: v })}
              options={bookingStatusEnum.enumValues}
              placeholder="Any status"
              allLabel="Any status"
              width="w-full"
              renderLabel={friendlyEnumLabel}
            />
          </FilterField>
          <FilterField icon={CreditCard} label="Payment status">
            <FilterSelect
              value={filters.paymentStatus}
              onChange={(v) => updateFilter({ paymentStatus: v })}
              options={[...PAYMENT_DISPLAY_STATUSES]}
              placeholder="Any payment"
              allLabel="Any payment"
              width="w-full"
              renderLabel={friendlyEnumLabel}
            />
          </FilterField>
          <FilterField icon={Compass} label="Booking type">
            <FilterSelect
              value={filters.bookingType}
              onChange={(v) => updateFilter({ bookingType: v })}
              options={bookingTypeEnum.enumValues}
              placeholder="Any type"
              allLabel="Any type"
              width="w-full"
              renderLabel={friendlyEnumLabel}
            />
          </FilterField>
          <FilterField icon={User} label="Assigned admin">
            <FilterSelect
              value={filters.assignedAdminId}
              onChange={(v) => updateFilter({ assignedAdminId: v })}
              options={adminIds}
              placeholder="Any admin"
              allLabel="Any admin"
              width="w-full"
              renderLabel={(id) => getAdminLabel(findAdmin(id))}
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
            <FilterSelect
              value={
                filters.needsCaptain === true
                  ? "yes"
                  : filters.needsCaptain === false
                    ? "no"
                    : null
              }
              onChange={(v) =>
                updateFilter({
                  needsCaptain: v === "yes" ? true : v === "no" ? false : null,
                })
              }
              options={["yes", "no"]}
              placeholder="Any"
              allLabel="Any"
              width="w-full"
              renderLabel={(v) => (v === "yes" ? "With captain" : "Self-drive")}
            />
          </FilterField>
        </FilterPopover>
      </AdminToolbar>

      <FilterChips chips={chips} onClearAll={clearAll} />
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
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
