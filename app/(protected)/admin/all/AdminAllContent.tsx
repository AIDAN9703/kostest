"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { computeOpsRevenueCents } from "@/shared/lib/utils/ops-revenue";
import { format } from "date-fns";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  CalendarDays,
  MessageSquare,
  Search,
  ArrowUpDown,
  Filter,
  MoreVertical,
  Eye,
  Copy,
  Check,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { InlineOpsCell } from "@/features/bookings/components/admin/InlineOpsCell";
import { InlineOpsSelectCell } from "@/features/bookings/components/admin/InlineOpsSelectCell";

function CopyTextButton({
  text,
  label,
}: {
  text: string;
  label: "email" | "phone";
}) {
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
  /** Primary sort / display anchor: booking start, inquiry preferred date or created */
  date: Date | null;
  /** Booking charter end (inquiries: null) */
  endDate: Date | null;
  href: string;
  amount?: number | null;
  /** Only for inquiries: show subtle "Needs contact" under contact info */
  needsContact?: boolean;
}

export interface UnifiedItemBooking extends UnifiedItemBase {
  type: "booking";
  bookingId: string;
  /** From booking_pricing — used with expense to show REV (total − expense). */
  totalAmountCents?: number | null;
  opsExpenseCents?: number | null;
  opsPaidCents?: number | null;
  opsBalanceOwnerCents?: number | null;
  opsBalanceClientCents?: number | null;
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
}

export interface UnifiedItemInquiry extends UnifiedItemBase {
  type: "inquiry";
}

export type UnifiedItem = UnifiedItemBooking | UnifiedItemInquiry;

function formatOpsRevenueCell(item: UnifiedItemBooking): string {
  const rev = computeOpsRevenueCents(item.totalAmountCents, item.opsExpenseCents);
  return rev != null ? formatCentsAsCurrency(rev) : "—";
}

/** Inquiry rows: spacer cells for booking-only ops columns (see booking row). */
const BOOKING_OPS_INLINE_PLACEHOLDERS = 11;

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
              <div key={field} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
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

/** Second line of date cell: start–end for bookings, or single time */
function formatDateCellTimeLine(item: UnifiedItem): string {
  if (!item.date) return "";
  const start = new Date(item.date);
  if (item.type === "booking" && item.endDate) {
    const end = new Date(item.endDate);
    const sameCalendarDay =
      format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
    return sameCalendarDay
      ? `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
      : `${format(start, "MMM d, h:mm a")} – ${format(end, "MMM d, h:mm a")}`;
  }
  return format(start, "h:mm a");
}

interface AdminAllContentProps {
  items: UnifiedItem[];
}

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "booking", label: "Bookings" },
  { value: "inquiry", label: "Inquiries" },
] as const;

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "GMV / total (high → low)" },
] as const;

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

export default function AdminAllContent({ items }: AdminAllContentProps) {
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get("type") || "all");
  const [sort, setSort] = useState<string>(() => searchParams.get("sort") || "date-desc");
  const [search, setSearch] = useState<string>(() => searchParams.get("q") || "");

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

    if (typeFilter !== "all") {
      result = result.filter((i) => i.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => {
        const phone = (i.customerPhone ?? "").toLowerCase();
        return (
          i.customerName.toLowerCase().includes(q) ||
          i.customerEmail.toLowerCase().includes(q) ||
          phone.includes(q)
        );
      });
    }

    switch (sort) {
      case "date-asc":
        result.sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return ta - tb;
        });
        break;
      case "date-desc":
        result.sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });
        break;
      case "amount-desc":
        result.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
        break;
      default:
        result.sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });
    }

    return result;
  }, [items, typeFilter, search, sort]);

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          <Select value={sort} onValueChange={setSort}>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} of {items.length}
        </p>
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
                  : "Try adjusting your filters or search."
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Customer</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead
                  className="align-middle text-right whitespace-nowrap px-1.5"
                  title="From booking pricing (total charter / quote)"
                >
                  GMV (total)
                </TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Expense</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">REV</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Paid</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Balance owner</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Balance client</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5 max-w-[4rem]">Crew</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5 max-w-[4rem]">Note</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Status flags</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Commission (agent)</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Commission (KOS)</TableHead>
                <TableHead className="align-middle whitespace-nowrap px-1.5">Source</TableHead>
                <TableHead className="whitespace-nowrap text-right px-1.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <TableRow
                  key={`${item.type}-${item.id}`}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="whitespace-nowrap">{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="align-top min-w-[200px] max-w-[260px]">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{item.customerName}</div>
                      <div className="flex items-center gap-0.5 min-w-0">
                        <span className="text-sm text-muted-foreground truncate">
                          {item.customerEmail || "—"}
                        </span>
                        <CopyTextButton text={item.customerEmail} label="email" />
                      </div>
                      <div className="flex items-center gap-0.5 min-w-0">
                        <span className="text-sm text-muted-foreground truncate">
                          {item.customerPhone?.trim() ? item.customerPhone.trim() : "—"}
                        </span>
                        <CopyTextButton text={item.customerPhone ?? ""} label="phone" />
                      </div>
                      {item.type === "inquiry" && item.needsContact && (
                        <span className="inline-block text-xs text-amber-600 dark:text-amber-400">
                          Needs contact
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.date ? (
                      <div className="text-sm">
                        <div className="text-foreground">
                          {format(new Date(item.date), "MMM d, yyyy")}
                        </div>
                        <div className="text-muted-foreground tabular-nums">
                          {formatDateCellTimeLine(item)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle text-right whitespace-nowrap px-1.5">
                    {item.amount != null && item.amount > 0 ? (
                      <span className="inline-flex min-h-7 items-center justify-end font-medium text-foreground tabular-nums">
                        {formatCentsAsCurrency(item.amount * 100)}
                      </span>
                    ) : (
                      <span className="inline-flex min-h-7 items-center justify-end text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {item.type === "booking" ? (
                    <>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="expenseCents"
                          value={item.opsExpenseCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <span className="inline-flex min-h-7 items-center text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-300">
                          {formatOpsRevenueCell(item)}
                        </span>
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="paidCents"
                          value={item.opsPaidCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="balanceOwnerCents"
                          value={item.opsBalanceOwnerCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="balanceClientCents"
                          value={item.opsBalanceClientCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle max-w-[5rem] px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="crewName"
                          value={item.opsCrewName}
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle max-w-[5rem] px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="opsNote"
                          value={item.opsNote}
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5 whitespace-nowrap">
                        <OpsStatusFlagsButton bookingId={item.bookingId} item={item} />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionAgentCents"
                          value={item.opsCommissionAgentCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionKosCents"
                          value={item.opsCommissionKosCents}
                          isCents
                          compact
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="align-middle px-1.5">
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
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={item.href} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
