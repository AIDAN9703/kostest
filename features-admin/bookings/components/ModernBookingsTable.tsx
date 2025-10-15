"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarCheck,
  Eye,
  Mail,
  Trash2,
  Download,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type BookingListItem } from "../booking.types";
import {
  formatCurrency,
  formatDate,
  formatTime12Hour,
} from "@/shared/utils/general-utils";
import { parseISODateTimeInBoatTimezone } from "@/shared/utils/booking-utils";
import { format } from "date-fns";
import { StatusBadge } from "@/shared/utils/badge-utils";

// Props interface
interface ModernBookingsTableProps {
  bookings: BookingListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
  onDelete?: (bookingId: string) => void;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<BookingListItem>();

export function ModernBookingsTable({
  bookings,
  pagination,
  loading = false,
  onDelete,
  onPageChange,
}: ModernBookingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Get selected bookings
  const selectedBookings = useMemo(() => {
    return bookings.filter((_, index) => rowSelection[index]);
  }, [bookings, rowSelection]);

  // Handle export list
  const handleExportList = () => {
    const bookingList = selectedBookings
      .map(
        (b) =>
          `${b.customerName} - ${b.boatName} - ${formatCurrency(b.totalAmount || 0)}`
      )
      .join("\n");
    navigator.clipboard.writeText(bookingList);
    alert(`Copied ${selectedBookings.length} bookings to clipboard!`);
  };

  // Define columns
  const columns = useMemo<ColumnDef<BookingListItem, any>[]>(
    () => [
      // Selection column
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div className="flex items-center gap-2 min-w-[180px]">
              <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {booking.userProfileImage ? (
                  <Image
                    src={booking.userProfileImage}
                    alt={booking.customerName || "Customer"}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-xs font-medium">
                    {booking.customerName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {booking.customerName || "Unknown"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {booking.customerEmail || "No email"}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("boatName", {
        header: "Boat",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div className="flex items-center gap-2 min-w-[150px]">
              <div className="h-8 w-8 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {booking.boatMainImage ? (
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-blue-50">
                    <CalendarCheck className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {booking.boatName || "Unknown Boat"}
                </div>
                <div className="text-xs text-gray-500 capitalize truncate">
                  {booking.boatCategory?.toLowerCase().replace("_", " ") ||
                    "No category"}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("startDateTime", {
        header: "Date & Time",
        cell: (info) => {
          const booking = info.row.original;
          const startDateTime = booking.startDateTime;
          const endDateTime = booking.endDateTime;

          if (!startDateTime) {
            return <div className="text-sm text-gray-500">No date</div>;
          }

          // Handle both Date objects and ISO strings
          const startISOString =
            startDateTime instanceof Date
              ? startDateTime.toISOString()
              : startDateTime;
          const endISOString = endDateTime
            ? endDateTime instanceof Date
              ? endDateTime.toISOString()
              : endDateTime
            : null;

          const { date: startDate, time: startTime } =
            parseISODateTimeInBoatTimezone(startISOString);
          const { time: endTime } = endISOString
            ? parseISODateTimeInBoatTimezone(endISOString)
            : { time: null };

          return (
            <div className="text-sm min-w-[140px]">
              <div className="text-gray-900 font-medium">
                {startDate ? format(startDate, "MMM d, yyyy") : "No date"}
              </div>
              <div className="text-xs text-gray-500">
                {startTime ? formatTime12Hour(startTime) : "No time"} -{" "}
                {endTime ? formatTime12Hour(endTime) : "No time"}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("bookingStatus", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return <StatusBadge status={status} />;
        },
      }),
      columnHelper.accessor("paymentStatus", {
        header: "Payment",
        cell: (info) => {
          const status = info.getValue();
          return <StatusBadge status={status || "UNKNOWN"} />;
        },
      }),
      columnHelper.accessor("totalAmount", {
        header: "Amount",
        cell: (info) => {
          const amount = info.getValue();
          const passengers = info.row.original.numberOfPassengers;
          const needsCaptain = info.row.original.needsCaptain;
          return (
            <div className="text-sm min-w-[100px]">
              <div className="font-medium text-gray-900">
                {formatCurrency(amount || 0)}
              </div>
              <div className="text-xs text-gray-500">
                {passengers} guest{passengers !== 1 ? "s" : ""}
                {needsCaptain && <span className="ml-1">• Captain</span>}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Link href={`/admin/bookings/${booking.id}`} prefetch={false}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>
              </Link>
              <a href={`mailto:${booking.customerEmail}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Mail className="h-4 w-4 text-slate-600" />
                </Button>
              </a>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(booking.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [onDelete]
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Multi-select toolbar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {Object.keys(rowSelection).length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="h-7 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportList}
              className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export List
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50/70 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200/70">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp className="h-3.5 w-3.5" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200/70 bg-white">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium">
            {(pagination.page - 1) * pagination.limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}
          </span>{" "}
          of <span className="font-medium">{pagination.totalCount}</span>{" "}
          bookings
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            }
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
