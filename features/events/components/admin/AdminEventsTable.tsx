"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import {
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
} from "lucide-react";
import type { EventListItem } from "@/features/events/events.types";
import { formatDate } from "@/shared/lib/utils/general-utils";

interface AdminEventsTableProps {
  events: EventListItem[];
  loading?: boolean;
  onEdit: (event: EventListItem) => void;
  onDelete: (eventId: string) => void;
}

const columnHelper = createColumnHelper<EventListItem>();

function formatTime(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getTotalSold(tiers: EventListItem["ticketTiers"]): number {
  return tiers?.reduce((sum, t) => sum + (t.soldQuantity ?? 0), 0) ?? 0;
}

function getTotalRevenue(tiers: EventListItem["ticketTiers"]): number {
  return (
    tiers?.reduce(
      (sum, t) => sum + (t.soldQuantity ?? 0) * parseFloat(t.price || "0"),
      0
    ) ?? 0
  );
}

function getStripeStatus(event: EventListItem) {
  if (!event.stripeProductId) return { status: "not_setup", count: 0 };
  const withPrices = event.ticketTiers?.filter((t) => t.stripePriceId) ?? [];
  const total = event.ticketTiers?.length ?? 0;
  if (withPrices.length === 0) return { status: "partial", count: 0 };
  if (withPrices.length === total) return { status: "complete", count: total };
  return { status: "partial", count: withPrices.length };
}

export function AdminEventsTable({
  events,
  loading,
  onEdit,
  onDelete,
}: AdminEventsTableProps) {
  const columns = useMemo<ColumnDef<EventListItem, any>[]>(
    () => [
      columnHelper.accessor("title", {
        id: "event",
        header: "Event",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="min-w-0 overflow-hidden">
              <div className="font-medium text-foreground text-sm truncate">
                {e.title}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {e.slug}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("eventDate", {
        header: "Date & Time",
        cell: ({ row }) => {
          const e = row.original;
          const date =
            e.eventDate instanceof Date
              ? e.eventDate
              : e.eventDate
                ? new Date(e.eventDate)
                : null;
          return (
            <div className="text-sm">
              <div className="font-medium">
                {date ? formatDate(date) : "—"}
              </div>
              {(e.startTime || e.endTime) && (
                <div className="text-xs text-muted-foreground">
                  {e.startTime && formatTime(e.startTime)}
                  {e.startTime && e.endTime && " - "}
                  {e.endTime && formatTime(e.endTime)}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="text-sm min-w-0 overflow-hidden">
              {e.location && (
                <div className="truncate">{e.location}</div>
              )}
              {e.yachtName && (
                <div className="text-muted-foreground truncate">
                  {e.yachtName}
                </div>
              )}
              {!e.location && !e.yachtName && "—"}
            </div>
          );
        },
      }),
      columnHelper.accessor("totalCapacity", {
        header: "Capacity",
        cell: ({ row }) => {
          const e = row.original;
          const sold = getTotalSold(e.ticketTiers);
          return (
            <span className="text-sm">
              {sold} / {e.totalCapacity}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => {
          const e = row.original;
          const rev = getTotalRevenue(e.ticketTiers);
          return (
            <span className="text-sm font-medium">
              ${rev.toFixed(2)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "stripe",
        header: "Stripe",
        cell: ({ row }) => {
          const e = row.original;
          const { status, count } = getStripeStatus(e);
          if (status === "complete")
            return (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Complete
              </Badge>
            );
          if (status === "partial")
            return (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Partial ({count})
              </Badge>
            );
          return (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Not Setup
            </Badge>
          );
        },
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "secondary"}>
            {info.getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-2">Actions</div>,
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onEdit(e)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      if (confirm(`Delete "${e.title}"?`)) onDelete(e.id);
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No events found
          </h3>
          <p className="text-sm text-muted-foreground">
            Create your first event to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto">
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky top-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={
                      cell.column.id === "event"
                        ? "px-4 py-3 overflow-hidden"
                        : "px-4 py-3"
                    }
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
