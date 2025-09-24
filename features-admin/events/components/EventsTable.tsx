"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Calendar, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Event } from "../hooks/useEventsApi";

interface EventsTableProps {
  events: Event[];
  loading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
}

const columnHelper = createColumnHelper<Event>();

export function EventsTable({ 
  events, 
  loading, 
  onEdit, 
  onDelete 
}: EventsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalSold = (ticketTiers: any[]) => {
    return ticketTiers.reduce((sum, tier) => sum + (tier.soldQuantity || 0), 0);
  };

  const getTotalRevenue = (ticketTiers: any[]) => {
    return ticketTiers.reduce((sum, tier) => sum + (tier.soldQuantity * parseFloat(tier.price || 0)), 0);
  };

  const getStripeSetupStatus = (event: Event) => {
    if (!event.stripeProductId) return { status: 'not_setup', count: 0 };
    
    const tiersWithPrices = event.ticketTiers.filter((tier: any) => tier.stripePriceId);
    const totalTiers = event.ticketTiers.length;
    
    if (tiersWithPrices.length === 0) return { status: 'partial', count: 0 };
    if (tiersWithPrices.length === totalTiers) return { status: 'complete', count: totalTiers };
    return { status: 'partial', count: tiersWithPrices.length };
  };

  const getStripeStatusBadge = (status: string, count: number) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partial ({count})</Badge>;
      default:
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Not Setup</Badge>;
    }
  };

  const columns = [
    columnHelper.accessor("title", {
      header: "Event",
      cell: (info) => (
        <div>
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-sm text-muted-foreground">{info.row.original.slug}</div>
        </div>
      ),
    }),
    columnHelper.accessor("eventDate", {
      header: "Date & Time",
      cell: (info) => {
        const event = info.row.original;
        return (
          <div>
            <div className="text-sm font-medium">
              {formatDate(info.getValue())}
            </div>
            {event.startTime && (
              <div className="text-sm text-muted-foreground">
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("location", {
      header: "Location",
      cell: (info) => {
        const event = info.row.original;
        return (
          <div>
            {info.getValue() && (
              <div className="text-sm">{info.getValue()}</div>
            )}
            {event.yachtName && (
              <div className="text-sm text-muted-foreground">{event.yachtName}</div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("totalCapacity", {
      header: "Capacity",
      cell: (info) => {
        const event = info.row.original;
        const totalSold = getTotalSold(event.ticketTiers);
        return (
          <div className="text-sm">
            {totalSold} / {info.getValue()}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "revenue",
      header: "Revenue",
      cell: (info) => {
        const event = info.row.original;
        const revenue = getTotalRevenue(event.ticketTiers);
        return (
          <div className="text-sm font-medium">
            ${revenue.toFixed(2)}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "stripeSetup",
      header: "Stripe Setup",
      cell: (info) => {
        const event = info.row.original;
        const stripeStatus = getStripeSetupStatus(event);
        return getStripeStatusBadge(stripeStatus.status, stripeStatus.count);
      },
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => (
        <Badge variant={info.getValue() ? "default" : "secondary"}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const event = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={Calendar}
            title="No events found"
            description="Create your first event using the Actions button in the header"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Events</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search events..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
