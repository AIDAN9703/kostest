"use client";

import { useState, useMemo, useCallback } from "react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarCheck,
  Eye,
  Mail,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type BookingListItem } from "../booking.types";
import { formatCurrency, formatTime12Hour } from "@/shared/utils/general-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/utils/date-helpers";
import { format } from "date-fns";
import { StatusBadge } from "@/shared/utils/badge-utils";
import {
  approveBookingRequest,
  denyBookingRequest,
  modifyBookingRequest,
} from "@/features/bookings/actions/admin-booking-actions";
import { useToast } from "@/shared/hooks/use-toast";

interface AdminBookingsTableProps {
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
  onRefresh?: () => void;
}

const columnHelper = createColumnHelper<BookingListItem>();

export function AdminBookingsTable({
  bookings,
  pagination,
  loading = false,
  onDelete,
  onPageChange,
  onRefresh,
}: AdminBookingsTableProps) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = useCallback(
    async (
      action: () => Promise<{
        success: boolean;
        message?: string;
        error?: string;
      }>,
      successMessage: string
    ) => {
      try {
        const result = await action();
        if (result.success) {
          toast({ title: successMessage, description: result.message });
          onRefresh?.();
        } else {
          toast({
            title: "Error",
            description: result.error || "Action failed",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Action failed",
          variant: "destructive",
        });
      }
    },
    [toast, onRefresh]
  );

  const handleApprove = useCallback(
    (bookingId: string) => {
      setActionLoading(bookingId);
      handleAction(
        () => approveBookingRequest(bookingId),
        "Booking Approved"
      ).finally(() => setActionLoading(null));
    },
    [handleAction]
  );

  const handleDeny = useCallback(
    (bookingId: string) => {
      const reason = prompt("Reason for denial:");
      if (!reason?.trim()) return;
      setActionLoading(bookingId);
      handleAction(
        () => denyBookingRequest(bookingId, reason),
        "Booking Denied"
      ).finally(() => setActionLoading(null));
    },
    [handleAction]
  );

  const handleModify = useCallback(
    (bookingId: string) => {
      const notes = prompt("Modification notes:");
      if (!notes?.trim()) return;
      setActionLoading(bookingId);
      handleAction(
        () => modifyBookingRequest(bookingId, {}, notes),
        "Booking Modified"
      ).finally(() => setActionLoading(null));
    },
    [handleAction]
  );

  const columns = useMemo<ColumnDef<BookingListItem, any>[]>(
    () => [
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: ({ row }) => {
          const booking = row.original;
          const displayName =
            booking.customerName || booking.userEmail || "Unknown";
          return (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gray-100 overflow-hidden shrink-0">
                {booking.userProfileImage ? (
                  <Image
                    src={booking.userProfileImage}
                    alt={displayName}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-blue-600 text-white text-xs font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {displayName}
                </div>
                {booking.customerEmail && (
                  <div className="text-xs text-gray-500 truncate">
                    {booking.customerEmail}
                  </div>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("boatName", {
        header: "Boat",
        cell: ({ row }) => {
          const booking = row.original;
          return (
            <div className="flex items-center gap-2">
              {booking.boatMainImage && (
                <div className="h-7 w-7 rounded overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="font-medium text-gray-900 text-sm truncate">
                {booking.boatName || "Unknown"}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("startDateTime", {
        header: "Date & Time",
        cell: ({ row }) => {
          const booking = row.original;
          const startDateTime = booking.startDateTime;
          const endDateTime = booking.endDateTime;

          if (!startDateTime)
            return <span className="text-sm text-gray-400">—</span>;

          const { date: startDate, time: startTime } =
            parseDateTimeInBoatTimezone(startDateTime);
          const { time: endTime } = endDateTime
            ? parseDateTimeInBoatTimezone(endDateTime)
            : { time: null };

          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {startDate ? format(startDate, "MMM d") : "—"}
              </div>
              <div className="text-xs text-gray-500">
                {startTime ? formatTime12Hour(startTime) : ""}
                {endTime && ` - ${formatTime12Hour(endTime)}`}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const booking = row.original;
          return (
            <div className="flex flex-col gap-1">
              <StatusBadge status={booking.bookingStatus} />
              {booking.paymentStatus && (
                <StatusBadge
                  status={booking.paymentStatus}
                  className="border border-gray-300 bg-white"
                />
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "assignedAdmin",
        header: "Assigned Admin",
        cell: ({ row }) => {
          const booking = row.original;
          if (!booking.assignedAdminId) {
            return <span className="text-sm text-gray-400">—</span>;
          }
          const adminName =
            booking.assignedAdminFirstName || booking.assignedAdminLastName
              ? `${booking.assignedAdminFirstName || ""} ${booking.assignedAdminLastName || ""}`.trim()
              : booking.assignedAdminEmail || "Unknown";
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900 truncate">
                {adminName}
              </div>
              {booking.contactedAt && (
                <div className="text-xs text-gray-500">
                  Contacted {format(new Date(booking.contactedAt), "MMM d")}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("totalAmount", {
        header: "Amount",
        cell: (info) => (
          <div className="font-medium text-gray-900 text-sm">
            {formatCurrency(info.getValue() || 0)}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const booking = row.original;
          const isPendingRequest =
            booking.bookingType === "REQUEST" &&
            booking.bookingStatus === "PENDING";
          const isLoading = actionLoading === booking.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isPendingRequest && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleApprove(booking.id)}
                      disabled={isLoading}
                      className="text-green-600 cursor-pointer"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeny(booking.id)}
                      disabled={isLoading}
                      className="text-red-600 cursor-pointer"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Deny
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleModify(booking.id)}
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modify
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {booking.customerEmail && (
                  <DropdownMenuItem asChild>
                    <a
                      href={`mailto:${booking.customerEmail}`}
                      className="cursor-pointer"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(booking.id)}
                      className="text-red-600 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [handleApprove, handleDeny, handleModify, actionLoading, onDelete]
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
        <div className="text-sm text-gray-500">
          Showing {pagination.page * pagination.limit - pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.totalCount)}{" "}
          of {pagination.totalCount} bookings
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
          <span className="text-sm text-gray-700 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
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
