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
import { format } from "date-fns";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  CalendarDays,
  FileText,
  MessageSquare,
  Search,
  ArrowUpDown,
  Filter,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { OpsRowContent } from "@/features/bookings/components/admin/OpsRowContent";

export interface UnifiedItemBase {
  id: string;
  type: "booking" | "inquiry";
  customerName: string;
  customerEmail: string;
  date: Date | null;
  status: string;
  href: string;
  amount?: number | null;
  needsAttention?: boolean;
}

export interface UnifiedItemBooking extends UnifiedItemBase {
  type: "booking";
  bookingId: string;
  opsExpenseCents?: number | null;
  opsRevenueCents?: number | null;
  opsBalanceOwnerCents?: number | null;
  opsCrewName?: string | null;
  opsContractSigned?: boolean | null;
  opsCaptainPaid?: boolean | null;
  opsCommissionCents?: number | null;
  opsSourceOverride?: string | null;
}

export interface UnifiedItemInquiry extends UnifiedItemBase {
  type: "inquiry";
}

export type UnifiedItem = UnifiedItemBooking | UnifiedItemInquiry;

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
  { value: "status", label: "Status" },
  { value: "amount-desc", label: "Amount (high → low)" },
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

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getStatusBadge(status: string, needsAttention?: boolean) {
  const statusUpper = status.toUpperCase();
  const formatted = formatStatus(status);
  if (needsAttention) {
    return (
      <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400">
        {formatted}
      </Badge>
    );
  }
  if (statusUpper === "PENDING" || statusUpper === "NEEDS_CONTACT") {
    return <Badge variant="secondary">{formatted}</Badge>;
  }
  if (
    statusUpper === "CONFIRMED" ||
    statusUpper === "ACCEPTED" ||
    statusUpper === "WON" ||
    statusUpper === "PUBLISHED" ||
    statusUpper === "CONTACTED"
  ) {
    return (
      <Badge
        variant="secondary"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200"
      >
        {formatted}
      </Badge>
    );
  }
  if (
    statusUpper === "CANCELLED" ||
    statusUpper === "LOST" ||
    statusUpper === "ABANDONED" ||
    statusUpper === "EXPIRED"
  ) {
    return (
      <Badge
        variant="secondary"
        className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-200"
      >
        {formatted}
      </Badge>
    );
  }
  if (statusUpper === "DRAFT") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        {formatted}
      </Badge>
    );
  }
  return <Badge variant="secondary">{formatted}</Badge>;
}

export default function AdminAllContent({ items }: AdminAllContentProps) {
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get("type") || "all");
  const [sort, setSort] = useState<string>(() => searchParams.get("sort") || "date-desc");
  const [search, setSearch] = useState<string>(() => searchParams.get("q") || "");
  const [showOps, setShowOps] = useState<boolean>(() => searchParams.get("showOps") === "true");

  const stats = useMemo(() => {
    const byType = { booking: 0, inquiry: 0 };
    let needsAttention = 0;
    for (const item of items) {
      byType[item.type]++;
      if (item.needsAttention) needsAttention++;
    }
    return {
      total: items.length,
      ...byType,
      needsAttention,
    };
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (typeFilter !== "all") {
      result = result.filter((i) => i.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) => i.customerName.toLowerCase().includes(q) || i.customerEmail.toLowerCase().includes(q)
      );
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
      case "status":
        result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
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
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Needs attention</p>
          <p className="text-2xl font-semibold text-amber-700 dark:text-amber-400">
            {stats.needsAttention}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
          <div className="flex items-center gap-2">
            <Switch id="show-ops" checked={showOps} onCheckedChange={setShowOps} />
            <Label htmlFor="show-ops" className="text-sm font-medium cursor-pointer">
              Show ops
            </Label>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} of {items.length}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
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
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  <TableRow className="group hover:bg-muted/30 transition-colors">
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{item.customerName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {item.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.date ? (
                        <div className="text-sm">
                          <div className="text-foreground">
                            {format(new Date(item.date), "MMM d, yyyy")}
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(item.date), "h:mm a")}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {item.needsAttention && (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        {getStatusBadge(item.status, item.needsAttention)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.amount != null && item.amount > 0 ? (
                        <span className="font-medium text-foreground">
                          {formatCentsAsCurrency(item.amount * 100)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View
                        <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </TableCell>
                  </TableRow>
                  {item.type === "booking" && showOps && (
                    <TableRow className="border-t-2 border-b-2 border-border bg-muted/30 hover:bg-muted/40">
                      <TableCell colSpan={6} className="border-l-2 border-l-primary/30 py-4">
                        <OpsRowContent
                          bookingId={item.bookingId}
                          opsExpenseCents={item.opsExpenseCents}
                          opsRevenueCents={item.opsRevenueCents}
                          opsBalanceOwnerCents={item.opsBalanceOwnerCents}
                          opsCrewName={item.opsCrewName}
                          opsContractSigned={item.opsContractSigned}
                          opsCaptainPaid={item.opsCaptainPaid}
                          opsCommissionCents={item.opsCommissionCents}
                          opsSourceOverride={item.opsSourceOverride}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
