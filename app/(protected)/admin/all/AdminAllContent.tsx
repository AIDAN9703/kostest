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
  MessageSquare,
  Search,
  ArrowUpDown,
  Filter,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { InlineOpsCell } from "@/features/bookings/components/admin/InlineOpsCell";

export interface UnifiedItemBase {
  id: string;
  type: "booking" | "inquiry";
  customerName: string;
  customerEmail: string;
  date: Date | null;
  href: string;
  amount?: number | null;
  /** Only for inquiries: show subtle "Needs contact" under contact info */
  needsContact?: boolean;
}

export interface UnifiedItemBooking extends UnifiedItemBase {
  type: "booking";
  bookingId: string;
  opsExpenseCents?: number | null;
  opsGmvCents?: number | null;
  opsRevenueCents?: number | null;
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
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Expense</TableHead>
                <TableHead className="whitespace-nowrap">GMV</TableHead>
                <TableHead className="whitespace-nowrap">REV</TableHead>
                <TableHead className="whitespace-nowrap">PAID</TableHead>
                <TableHead className="whitespace-nowrap">Bal Owner</TableHead>
                <TableHead className="whitespace-nowrap">Bal Client</TableHead>
                <TableHead className="whitespace-nowrap">Crew</TableHead>
                <TableHead className="whitespace-nowrap">Note</TableHead>
                <TableHead className="whitespace-nowrap">Contract?</TableHead>
                <TableHead className="whitespace-nowrap">Connected?</TableHead>
                <TableHead className="whitespace-nowrap">C Paid?</TableHead>
                <TableHead className="whitespace-nowrap">Capt Paid?</TableHead>
                <TableHead className="whitespace-nowrap">All Paid?</TableHead>
                <TableHead className="whitespace-nowrap">Sheets?</TableHead>
                <TableHead className="whitespace-nowrap">Agent</TableHead>
                <TableHead className="whitespace-nowrap">Comm Agent</TableHead>
                <TableHead className="whitespace-nowrap">Comm KOS</TableHead>
                <TableHead className="whitespace-nowrap">Source</TableHead>
                <TableHead className="whitespace-nowrap text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <TableRow
                  key={`${item.type}-${item.id}`}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="whitespace-nowrap">{getTypeBadge(item.type)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div>
                      <div className="font-medium text-foreground">{item.customerName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {item.customerEmail}
                      </div>
                      {item.type === "inquiry" && item.needsContact && (
                        <span className="mt-0.5 inline-block text-xs text-amber-600 dark:text-amber-400">
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
                        <div className="text-muted-foreground">
                          {format(new Date(item.date), "h:mm a")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {item.amount != null && item.amount > 0 ? (
                      <span className="font-medium text-foreground">
                        {formatCentsAsCurrency(item.amount * 100)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {item.type === "booking" ? (
                    <>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="expenseCents"
                          value={item.opsExpenseCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="gmvCents"
                          value={item.opsGmvCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="revenueCents"
                          value={item.opsRevenueCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="paidCents"
                          value={item.opsPaidCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="balanceOwnerCents"
                          value={item.opsBalanceOwnerCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="balanceClientCents"
                          value={item.opsBalanceClientCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="crewName"
                          value={item.opsCrewName}
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="opsNote"
                          value={item.opsNote}
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="contractSigned"
                          value={item.opsContractSigned}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="connected"
                          value={item.opsConnected}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="clientPaid"
                          value={item.opsClientPaid}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="captainPaid"
                          value={item.opsCaptainPaid}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="allPaid"
                          value={item.opsAllPaid}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="sheetsSent"
                          value={item.opsSheetsSent}
                          isCheckbox
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="agentCode"
                          value={item.opsAgentCode}
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionAgentCents"
                          value={item.opsCommissionAgentCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="commissionKosCents"
                          value={item.opsCommissionKosCents}
                          isCents
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <InlineOpsCell
                          bookingId={item.bookingId}
                          field="sourceOverride"
                          value={item.opsSourceOverride}
                          placeholder="—"
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 18 }).map((_, i) => (
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
