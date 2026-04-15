"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  computeOpsBalanceClientCents,
  computeOpsBalanceOwnerCents,
  computeOpsRevenueCents,
} from "@/shared/lib/utils/ops-revenue";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  CalendarDays,
  MessageSquare,
  Search,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  Copy,
  Check,
  Flag,
  CalendarRange,
  Palette,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { InlineOpsCell } from "@/features/bookings/components/admin/InlineOpsCell";
import { InlineOpsSelectCell } from "@/features/bookings/components/admin/InlineOpsSelectCell";
import { assignAdminToBooking } from "@/features/bookings/actions/admin-booking.actions";
import { setAdminAllRowHighlight } from "@/features/admin/actions/admin-all-highlight.actions";
import {
  ADMIN_ALL_HIGHLIGHT_IDS,
  ADMIN_ALL_HIGHLIGHT_LEGEND,
  adminAllHighlightRowClass,
  adminAllHighlightSwatchClass,
} from "@/features/admin/adminAllRowHighlight";
import { adminAllSearchParams } from "@/features/admin/adminAllSearchParams";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const ASSIGN_UNASSIGNED = "__none__";

export type AdminAllAdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

function formatAdminOptionName(admin: AdminAllAdminOption): string {
  const n = [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim();
  return n || admin.email || "Unknown";
}

function AssignAdminCell({
  bookingId,
  assignedAdminId,
  admins,
}: {
  bookingId: string;
  assignedAdminId: string | null;
  admins: AdminAllAdminOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const value = assignedAdminId ?? ASSIGN_UNASSIGNED;

  if (admins.length === 0) {
    return null;
  }

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={async (v) => {
        const next = v === ASSIGN_UNASSIGNED ? null : v;
        setPending(true);
        try {
          const res = await assignAdminToBooking(bookingId, next);
          if (res.success) router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      <SelectTrigger
        className="h-8 max-w-[10rem] border-border/80 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent align="start" position="popper" onClick={(e) => e.stopPropagation()}>
        <SelectItem value={ASSIGN_UNASSIGNED} className="text-xs">
          Unassigned
        </SelectItem>
        {admins.map((admin) => (
          <SelectItem key={admin.id} value={admin.id} className="text-xs">
            {formatAdminOptionName(admin)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RowHighlightCell({ item }: { item: UnifiedItem }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const targetId = item.type === "booking" ? item.bookingId : item.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={pending}
          onClick={(e) => e.stopPropagation()}
          title="Set row color"
          aria-label="Set row color"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          className="text-xs"
          disabled={pending}
          onSelect={async (e) => {
            e.preventDefault();
            setPending(true);
            try {
              const res = await setAdminAllRowHighlight(
                item.type === "booking" ? "booking" : "inquiry",
                targetId,
                null
              );
              if (res.success) router.refresh();
            } finally {
              setPending(false);
            }
          }}
        >
          Clear highlight
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ADMIN_ALL_HIGHLIGHT_IDS.map((id) => (
          <DropdownMenuItem
            key={id}
            className="text-xs"
            disabled={pending}
            onSelect={async (e) => {
              e.preventDefault();
              setPending(true);
              try {
                const res = await setAdminAllRowHighlight(
                  item.type === "booking" ? "booking" : "inquiry",
                  targetId,
                  id
                );
                if (res.success) router.refresh();
              } finally {
                setPending(false);
              }
            }}
          >
            <span
              className={cn(
                "mr-2 inline-block h-3 w-3 shrink-0 rounded-sm",
                adminAllHighlightSwatchClass(id)
              )}
              aria-hidden
            />
            {ADMIN_ALL_HIGHLIGHT_LEGEND[id]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CopyTextButton({ text, label }: { text: string; label: "email" | "phone" }) {
  const [copied, setCopied] = useState(false);
  const trimmed = text.trim();
  const isEmpty = !trimmed;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEmpty) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may fail in non-secure contexts
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      disabled={isEmpty}
      title={isEmpty ? `No ${label}` : `Copy ${label}`}
      aria-label={isEmpty ? `No ${label}` : `Copy ${label}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export interface UnifiedItemBase {
  id: string;
  type: "booking" | "inquiry";
  customerName: string;
  customerEmail: string;
  /** Customer phone (booking: customerPhone; inquiry: phone) */
  customerPhone: string | null;
  /**
   * Trip/charter date for sort and date-range filter: booking start, inquiry preferred date only
   * (not request/created time).
   */
  sortDate: Date | null;
  /** Display date (inquiry may fall back to created when no trip date) */
  date: Date | null;
  /** Booking charter end (inquiries: null) */
  endDate: Date | null;
  href: string;
  amount?: number | null;
  /** Only for inquiries: show subtle "Needs contact" under contact info */
  needsContact?: boolean;
  /** Admin → All persisted row highlight */
  adminAllRowHighlight: string | null;
}

export interface UnifiedItemBooking extends UnifiedItemBase {
  type: "booking";
  bookingId: string;
  /** From booking_pricing — used with expense to show REV (total − expense). */
  totalAmountCents?: number | null;
  opsExpenseCents?: number | null;
  opsGmvCents?: number | null;
  opsPaidCents?: number | null;
  opsSentToOwnerCents?: number | null;
  opsCrewName?: string | null;
  opsNote?: string | null;
  opsContractSigned?: boolean | null;
  opsConnected?: boolean | null;
  opsClientPaid?: boolean | null;
  opsCaptainPaid?: boolean | null;
  opsAllPaid?: boolean | null;
  opsSheetsSent?: boolean | null;
  opsAgentCode?: string | null;
  opsCommissionAgentCents?: number | null;
  opsCommissionKosCents?: number | null;
  opsCommissionCents?: number | null;
  opsSourceOverride?: string | null;
  /** booking.assigned_admin_id */
  assignedAdminId: string | null;
}

export interface UnifiedItemInquiry extends UnifiedItemBase {
  type: "inquiry";
}

export type UnifiedItem = UnifiedItemBooking | UnifiedItemInquiry;

function formatOpsRevenueCell(item: UnifiedItemBooking): string {
  const rev = computeOpsRevenueCents(item.totalAmountCents, item.opsExpenseCents);
  return rev != null ? formatCentsAsCurrency(rev) : "";
}

/** Inquiry rows: spacer cells for booking-only ops columns (see booking row). */
const BOOKING_OPS_INLINE_PLACEHOLDERS = 12;

function countCheckedFlags(item: UnifiedItemBooking): number {
  return [
    item.opsContractSigned,
    item.opsConnected,
    item.opsClientPaid,
    item.opsCaptainPaid,
    item.opsAllPaid,
    item.opsSheetsSent,
  ].filter((v) => v === true).length;
}

/** Opens a popover with full labels for each status flag (keeps the table row compact). */
function OpsStatusFlagsButton({
  bookingId,
  item,
}: {
  bookingId: string;
  item: UnifiedItemBooking;
}) {
  const [open, setOpen] = useState(false);
  const specs = [
    { field: "contractSigned" as const, label: "Contract signed", v: item.opsContractSigned },
    { field: "connected" as const, label: "Connected", v: item.opsConnected },
    { field: "clientPaid" as const, label: "Client paid", v: item.opsClientPaid },
    { field: "captainPaid" as const, label: "Captain paid", v: item.opsCaptainPaid },
    { field: "allPaid" as const, label: "All paid", v: item.opsAllPaid },
    { field: "sheetsSent" as const, label: "Sheets sent", v: item.opsSheetsSent },
  ] as const;
  const n = countCheckedFlags(item);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 font-normal"
          aria-label="Open booking status flags"
        >
          <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Flags</span>
          <span className="text-[10px] tabular-nums text-muted-foreground">({n}/6)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 sm:w-96" align="start" side="bottom" sideOffset={6}>
        <div className="space-y-1">
          <p className="pb-2 text-sm font-semibold text-foreground">Booking status</p>
          <p className="pb-3 text-xs text-muted-foreground">
            Toggle each item; changes save when you click the checkbox.
          </p>
          <div className="space-y-3">
            {specs.map(({ field, label, v }) => (
              <div
                key={field}
                className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm leading-snug text-foreground">{label}</span>
                <InlineOpsCell bookingId={bookingId} field={field} value={v} isCheckbox />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Compact date column: avoids one long horizontal line that pushes GMV away. */
function DateCellContent({ item }: { item: UnifiedItem }) {
  if (!item.date) return null;
  const start = new Date(item.date);
  const title =
    item.type === "booking" && item.endDate
      ? `${format(start, "MMM d, yyyy h:mm a")} → ${format(new Date(item.endDate), "MMM d, yyyy h:mm a")}`
      : format(start, "MMM d, yyyy h:mm a");

  if (item.type === "booking" && item.endDate) {
    const end = new Date(item.endDate);
    const sameCalendarDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
    if (sameCalendarDay) {
      return (
        <div className="min-w-0 space-y-0.5" title={title}>
          <div className="leading-tight text-foreground">{format(start, "MMM d, yyyy")}</div>
          <div className="text-xs leading-snug text-muted-foreground tabular-nums">
            {format(start, "h:mm a")} – {format(end, "h:mm a")}
          </div>
        </div>
      );
    }
    return (
      <div className="min-w-0 space-y-0.5" title={title}>
        <div className="leading-tight text-foreground">
          {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
        </div>
        <div className="text-xs leading-snug text-muted-foreground tabular-nums">
          {format(start, "h:mm a")} → {format(end, "h:mm a")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-0.5" title={title}>
      <div className="leading-tight text-foreground">{format(start, "MMM d, yyyy")}</div>
      <div className="text-xs leading-snug text-muted-foreground tabular-nums">
        {format(start, "h:mm a")}
      </div>
    </div>
  );
}

interface AdminAllContentProps {
  items: UnifiedItem[];
  admins: AdminAllAdminOption[];
}

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "booking", label: "Bookings" },
  { value: "inquiry", label: "Inquiries" },
] as const;

const SORT_OPTIONS = [
  { value: "date-desc", label: "Trip date: newest first" },
  { value: "date-asc", label: "Trip date: oldest first" },
  { value: "amount-desc", label: "GMV / total (high → low)" },
] as const;

function getSortDateMs(item: UnifiedItem): number | null {
  if (!item.sortDate) return null;
  const t = new Date(item.sortDate).getTime();
  return Number.isNaN(t) ? null : t;
}

const YMD = "yyyy-MM-dd";

function parseYmdStart(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  return startOfDay(parse(ymd, YMD, new Date()));
}

function parseYmdEnd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  return endOfDay(parse(ymd, YMD, new Date()));
}

/** When either bound is set, rows without a date are excluded. */
function itemMatchesDateRange(item: UnifiedItem, dateFrom: string, dateTo: string): boolean {
  let df = dateFrom.trim();
  let dt = dateTo.trim();
  if (!df && !dt) return true;

  const ms = getSortDateMs(item);
  if (ms == null) return false;

  if (df && dt && df > dt) [df, dt] = [dt, df];

  const d = new Date(ms);
  if (df) {
    const from = parseYmdStart(df);
    if (from && d < from) return false;
  }
  if (dt) {
    const to = parseYmdEnd(dt);
    if (to && d > to) return false;
  }
  return true;
}

/** Trip date sort: missing dates last; tie-break by id for stable order. */
function compareByDateDesc(a: UnifiedItem, b: UnifiedItem): number {
  const ta = getSortDateMs(a);
  const tb = getSortDateMs(b);
  if (ta == null && tb == null) return a.id.localeCompare(b.id);
  if (ta == null) return 1;
  if (tb == null) return -1;
  if (tb !== ta) return tb - ta;
  return a.id.localeCompare(b.id);
}

function compareByDateAsc(a: UnifiedItem, b: UnifiedItem): number {
  const ta = getSortDateMs(a);
  const tb = getSortDateMs(b);
  if (ta == null && tb == null) return a.id.localeCompare(b.id);
  if (ta == null) return 1;
  if (tb == null) return -1;
  if (ta !== tb) return ta - tb;
  return a.id.localeCompare(b.id);
}

function getTypeBadge(type: string) {
  switch (type) {
    case "booking":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          Booking
        </Badge>
      );
    case "inquiry":
      return (
        <Badge
          variant="secondary"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Inquiry
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

export default function AdminAllContent({ items, admins }: AdminAllContentProps) {
  const router = useRouter();
  const [filters, setFilters] = useQueryStates(adminAllSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });

  const hasDateFilter = Boolean(filters.dateFrom?.trim() || filters.dateTo?.trim());

  const stats = useMemo(() => {
    const byType = { booking: 0, inquiry: 0 };
    for (const item of items) {
      byType[item.type]++;
    }
    return {
      total: items.length,
      ...byType,
    };
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (filters.type !== "all") {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      result = result.filter((i) => {
        const phone = (i.customerPhone ?? "").toLowerCase();
        return (
          i.customerName.toLowerCase().includes(q) ||
          i.customerEmail.toLowerCase().includes(q) ||
          phone.includes(q)
        );
      });
    }

    if (filters.dateFrom.trim() || filters.dateTo.trim()) {
      result = result.filter((i) => itemMatchesDateRange(i, filters.dateFrom, filters.dateTo));
    }

    switch (filters.sort) {
      case "date-asc":
        result.sort(compareByDateAsc);
        break;
      case "date-desc":
        result.sort(compareByDateDesc);
        break;
      case "amount-desc":
        result.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
        break;
      default:
        result.sort(compareByDateDesc);
    }

    return result;
  }, [items, filters.type, filters.q, filters.sort, filters.dateFrom, filters.dateTo]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Bookings</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.booking}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Inquiries</p>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
            {stats.inquiry}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select
            value={filters.type}
            onValueChange={(v) => setFilters({ type: v as typeof filters.type })}
          >
            <SelectTrigger className="w-[160px] rounded-xl">
              <Filter className="h-4 w-4 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sort}
            onValueChange={(v) => setFilters({ sort: v as typeof filters.sort })}
          >
            <SelectTrigger className="w-[160px] rounded-xl">
              <ArrowUpDown className="h-4 w-4 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`rounded-xl gap-1.5 ${hasDateFilter ? "border-primary/40 bg-primary/5" : ""}`}
              >
                <CalendarRange className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Date range</span>
                <span className="sm:hidden">Dates</span>
                {hasDateFilter ? (
                  <span className="max-w-[9rem] truncate text-xs font-normal text-muted-foreground">
                    {filters.dateFrom || "…"}–{filters.dateTo || "…"}
                  </span>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(100vw-2rem,22rem)] p-4" align="start">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Date range</p>
                  <p className="text-xs text-muted-foreground">
                    Uses trip date: charter start for bookings, preferred trip date for inquiries
                    (not request/created time). Rows with no trip date are hidden while a range is
                    set.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="text-xs text-muted-foreground">
                    From
                    <Input
                      type="date"
                      className="mt-1 rounded-lg"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ dateFrom: e.target.value })}
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    To
                    <Input
                      type="date"
                      className="mt-1 rounded-lg"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ dateTo: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      setFilters({
                        dateFrom: format(startOfWeek(now, { weekStartsOn: 1 }), YMD),
                        dateTo: format(endOfWeek(now, { weekStartsOn: 1 }), YMD),
                      });
                    }}
                  >
                    This week
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      setFilters({
                        dateFrom: format(startOfDay(subDays(now, 6)), YMD),
                        dateTo: format(endOfDay(now), YMD),
                      });
                    }}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      setFilters({
                        dateFrom: format(startOfDay(subDays(now, 29)), YMD),
                        dateTo: format(endOfDay(now), YMD),
                      });
                    }}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      setFilters({
                        dateFrom: format(startOfMonth(now), YMD),
                        dateTo: format(endOfMonth(now), YMD),
                      });
                    }}
                  >
                    This month
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setFilters({ dateFrom: "", dateTo: "" })}
                  disabled={!hasDateFilter}
                >
                  Clear dates
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} of {items.length}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/50 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Key</span>
        {ADMIN_ALL_HIGHLIGHT_IDS.map((id) => (
          <span key={id} className="inline-flex items-center gap-1.5">
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", adminAllHighlightSwatchClass(id))}
              aria-hidden
            />
            {ADMIN_ALL_HIGHLIGHT_LEGEND[id]}
          </span>
        ))}
      </div>

      {/* Table - all ops inline */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-x-auto">
        {filteredAndSortedItems.length === 0 ? (
          <div className="p-12">
            <EmptyState
              emoji="🔍"
              title={items.length === 0 ? "No items yet" : "No matches"}
              description={
                items.length === 0
                  ? "Bookings and inquiries will appear here."
                  : hasDateFilter
                    ? "Nothing in this date range on the loaded list. Widen the range or clear dates."
                    : "Try adjusting your filters or search."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 max-w-10 p-1 text-center" title="Row highlight">
                  <span className="sr-only">Highlight</span>
                  <Palette className="mx-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Customer</TableHead>
                <TableHead className="whitespace-nowrap min-w-[8rem] px-1.5">Agent</TableHead>
                <TableHead className="whitespace-normal">
                  <button
                    type="button"
                    className="inline-flex max-w-[9rem] flex-wrap items-center gap-1 text-left font-medium text-foreground hover:underline"
                    onClick={() => {
                      if (filters.sort === "date-desc") {
                        setFilters({ sort: "date-asc" });
                      } else {
                        setFilters({ sort: "date-desc" });
                      }
                    }}
                    title="Sort by trip date — charter start or inquiry preferred date (not request time)"
                  >
                    <span>Trip date</span>
                    {filters.sort === "date-desc" ? (
                      <ArrowDown
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    ) : filters.sort === "date-asc" ? (
                      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    ) : null}
                  </button>
                </TableHead>
                <TableHead
                  className="align-middle text-right whitespace-nowrap px-1.5"
                  title="From booking pricing (total charter / quote)"
                >
                  GMV (total)
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Expense</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">REV</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Paid</TableHead>
                <TableHead
                  className="align-middle whitespace-nowrap px-1.5 max-w-[4.5rem]"
                  title="Cumulative sent to boat owner; edits adjust balance owner"
                >
                  Sent owner
                </TableHead>
                <TableHead
                  className="align-middle whitespace-nowrap px-1.5"
                  title="Expense − sent to owner (computed on save)"
                >
                  Bal owner
                </TableHead>
                <TableHead
                  className="align-middle whitespace-nowrap px-1.5"
                  title="Charter balance owed by client: GMV − PAID (quote total if ops GMV empty)"
                >
                  Bal client
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5 max-w-[4rem]">
                  Crew
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5 max-w-[4rem]">
                  Note
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">
                  Status flags
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Comm(agent)</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Comm(KOS)</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <TableRow
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    "group cursor-pointer transition-colors",
                    adminAllHighlightRowClass(item.adminAllRowHighlight) ?? "hover:bg-muted/30"
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <TableCell
                    className="w-10 max-w-10 p-1 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowHighlightCell item={item} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="align-top min-w-0 w-[12rem] max-w-[12rem] sm:w-[13rem] sm:max-w-[13rem]">
                    <div className="min-w-0 space-y-1">
                      <div
                        className="truncate font-medium text-foreground"
                        title={item.customerName}
                      >
                        {item.customerName}
                      </div>
                      <div className="flex min-w-0 items-center gap-0.5">
                        {item.customerEmail ? (
                          <>
                            <span
                              className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
                              title={item.customerEmail}
                            >
                              {item.customerEmail}
                            </span>
                            <CopyTextButton text={item.customerEmail} label="email" />
                          </>
                        ) : null}
                      </div>
                      {item.customerPhone?.trim() ? (
                        <div className="flex min-w-0 items-center gap-0.5">
                          <span
                            className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
                            title={item.customerPhone.trim()}
                          >
                            {item.customerPhone.trim()}
                          </span>
                          <CopyTextButton text={item.customerPhone} label="phone" />
                        </div>
                      ) : null}
                      {item.type === "inquiry" && item.needsContact && (
                        <span className="inline-block text-xs text-amber-600 dark:text-amber-400">
                          Needs contact
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="align-middle min-w-[8rem] max-w-[11rem]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.type === "booking" ? (
                      <AssignAdminCell
                        bookingId={item.bookingId}
                        assignedAdminId={item.assignedAdminId}
                        admins={admins}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="align-middle min-w-0 max-w-[6.5rem] whitespace-normal sm:max-w-[7.5rem]">
                    {item.date ? (
                      <div className="text-sm break-words">
                        <DateCellContent item={item} />
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-middle text-right whitespace-nowrap px-1.5">
                    {item.amount != null && item.amount > 0 ? (
                      <span className="inline-flex min-h-7 items-center justify-end font-medium text-foreground tabular-nums">
                        {formatCentsAsCurrency(item.amount * 100)}
                      </span>
                    ) : null}
                  </TableCell>
                  {item.type === "booking" ? (
                    <>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="expenseCents"
                          value={item.opsExpenseCents}
                          isCents
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        {(() => {
                          const revLabel = formatOpsRevenueCell(item);
                          return revLabel ? (
                            <span className="inline-flex min-h-7 items-center text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-300">
                              {revLabel}
                            </span>
                          ) : (
                            <span className="inline-flex min-h-7 items-center" />
                          );
                        })()}
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="paidCents"
                          value={item.opsPaidCents}
                          isCents
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="sentToOwnerCents"
                          value={item.opsSentToOwnerCents}
                          isCents
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex min-h-7 items-center text-xs tabular-nums text-foreground">
                          {formatCentsAsCurrency(
                            computeOpsBalanceOwnerCents(
                              item.opsExpenseCents,
                              item.opsSentToOwnerCents
                            )
                          )}
                        </span>
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex min-h-7 items-center text-xs tabular-nums text-foreground">
                          {formatCentsAsCurrency(
                            computeOpsBalanceClientCents(
                              item.opsGmvCents,
                              item.opsPaidCents,
                              item.totalAmountCents
                            )
                          )}
                        </span>
                      </TableCell>
                      <TableCell
                        className="align-middle max-w-[5rem] px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="crewName"
                          value={item.opsCrewName}
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle max-w-[5rem] px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="opsNote"
                          value={item.opsNote}
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <OpsStatusFlagsButton bookingId={item.bookingId} item={item} />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionAgentCents"
                          value={item.opsCommissionAgentCents}
                          isCents
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionKosCents"
                          value={item.opsCommissionKosCents}
                          isCents
                          compact
                          placeholder=""
                        />
                      </TableCell>
                      <TableCell
                        className="align-middle px-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineOpsSelectCell
                          bookingId={item.bookingId}
                          variant="source"
                          value={item.opsSourceOverride}
                          compact
                          applyCommissionOnSourceChange
                          revenueCentsForCommission={computeOpsRevenueCents(
                            item.totalAmountCents,
                            item.opsExpenseCents
                          )}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      {Array.from({ length: BOOKING_OPS_INLINE_PLACEHOLDERS }).map((_, i) => (
                        <TableCell key={i} />
                      ))}
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
