"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  UserCheck,
  Phone,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type BookingListItem } from "@/features/bookings/booking.types";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { format } from "date-fns";
import {
  approveBookingRequest,
  denyBookingRequest,
  assignAdminToBooking,
  markBookingAsContacted,
} from "@/features/bookings/actions/admin-booking.actions";
import { useDeleteBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { OpsRowContent } from "./OpsRowContent";

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Prefer ops override; otherwise show a friendly version of the technical booking type. */
function getDisplaySource(b: BookingListItem): string {
  if (b.opsSourceOverride && b.opsSourceOverride.trim()) return b.opsSourceOverride.trim();
  if (!b.bookingType) return "—";
  return titleCase(b.bookingType);
}

/** Use ops GMV when admins have set it; otherwise fall back to the quote total. */
function getDisplayAmountCents(b: BookingListItem): number {
  if (b.opsGmvCents != null && b.opsGmvCents > 0) return b.opsGmvCents;
  return b.totalAmountCents ?? 0;
}

interface CopyableTextProps {
  value: string;
  /** Optional label used in the tooltip — e.g. "email", "phone". */
  label?: string;
  className?: string;
}

/** Compact muted line that copies its value with a tiny icon (visible on hover, persists ~1.5s after copy). */
function CopyableText({ value, label, className }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — silent */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label ?? value}`}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label ?? value}`}
      className={cn(
        "group/copy inline-flex max-w-full items-center gap-1.5 rounded-md px-1 -mx-1 py-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
        className,
      )}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/copy:opacity-100" />
      )}
    </button>
  );
}

interface Admin {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
}

interface AdminBookingsTableProps {
  bookings: BookingListItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  loading?: boolean;
  onPageChange?: (page: number) => void;
  admins?: Admin[];
  /** When true, pagination UI is hidden (use external Link-based pagination) */
  hidePagination?: boolean;
  /** When true, show expandable ops row below each booking */
  showOps?: boolean;
}

const columnHelper = createColumnHelper<BookingListItem>();

export function AdminBookingsTable({
  bookings,
  pagination,
  loading = false,
  onPageChange,
  admins: adminsProp = [],
  hidePagination,
  showOps = false,
}: AdminBookingsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteBooking = useDeleteBooking();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const admins = adminsProp;

  const handleRefresh = useCallback(() => router.refresh(), [router]);

  const handleDelete = useCallback(
    (bookingId: string) => {
      if (!confirm("Are you sure you want to delete this booking? This action cannot be undone."))
        return;
      deleteBooking.mutate(bookingId);
    },
    [deleteBooking]
  );

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
          handleRefresh();
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
    [toast, handleRefresh]
  );

  const handleApprove = useCallback(
    (bookingId: string) => {
      setActionLoading(bookingId);
      handleAction(() => approveBookingRequest(bookingId), "Booking Approved").finally(() =>
        setActionLoading(null)
      );
    },
    [handleAction]
  );

  const handleDeny = useCallback(
    (bookingId: string) => {
      const reason = prompt("Reason for denial:");
      if (!reason?.trim()) return;
      setActionLoading(bookingId);
      handleAction(() => denyBookingRequest(bookingId, reason), "Booking Denied").finally(() =>
        setActionLoading(null)
      );
    },
    [handleAction]
  );

  const handleAssignAdmin = useCallback(
    (bookingId: string, adminId: string) => {
      setActionLoading(bookingId);
      handleAction(() => assignAdminToBooking(bookingId, adminId), "Admin Assigned").finally(() =>
        setActionLoading(null)
      );
    },
    [handleAction]
  );

  const handleMarkContacted = useCallback(
    (bookingId: string) => {
      setActionLoading(bookingId);
      handleAction(() => markBookingAsContacted(bookingId), "Marked as Contacted").finally(() =>
        setActionLoading(null)
      );
    },
    [handleAction]
  );


  const columns = useMemo<ColumnDef<BookingListItem, any>[]>(
    () => [
      columnHelper.accessor("startDateTime", {
        header: "Date",
        cell: ({ row }) => {
          const booking = row.original;
          const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(
            booking.startDateTime,
          );
          const { time: endTime } = booking.endDateTime
            ? parseDateTimeInBoatTimezone(booking.endDateTime)
            : { time: "" };
          return (
            <div className="text-sm">
              <div className="font-medium text-foreground tabular-nums">
                {startDate ? format(startDate, "MMM d, yyyy") : "—"}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {startTime ? formatTime12Hour(startTime) : ""}
                {endTime && ` - ${formatTime12Hour(endTime)}`}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: ({ row }) => {
          const booking = row.original;
          const displayName = booking.customerName || booking.userEmail || "Unknown";
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
                {booking.userProfileImage ? (
                  <Image
                    src={booking.userProfileImage}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/15 text-sm font-medium text-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium leading-tight text-foreground">
                  {displayName}
                </div>
                {booking.customerEmail && (
                  <CopyableText
                    value={booking.customerEmail}
                    label="email"
                    className="mt-0.5 max-w-[14rem]"
                  />
                )}
                {booking.customerPhone && (
                  <CopyableText
                    value={booking.customerPhone}
                    label="phone"
                    className="max-w-[14rem]"
                  />
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
            <div className="flex items-center gap-2.5">
              {booking.boatMainImage && (
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {booking.boatName || "Unknown"}
                </span>
                {booking.bookingGroupId && (
                  <span className="shrink-0 inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {booking.bookingGroupName || "Group"}
                  </span>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "captain",
        header: "Captain",
        cell: ({ row }) => {
          const booking = row.original;
          if (booking.captainUserId) {
            const captainName =
              booking.captainFirstName || booking.captainLastName
                ? `${booking.captainFirstName || ""} ${booking.captainLastName || ""}`.trim()
                : booking.captainEmail || "Captain";
            return (
              <div className="text-sm">
                <div className="truncate font-medium text-foreground">{captainName}</div>
              </div>
            );
          }
          if (booking.needsCaptain) {
            return (
              <span className="text-xs italic text-amber-700 dark:text-amber-400">
                Captain needed
              </span>
            );
          }
          return <span className="text-sm text-muted-foreground">—</span>;
        },
      }),
      columnHelper.accessor("totalAmountCents", {
        header: "GMV",
        cell: ({ row }) => {
          const booking = row.original;
          const amount = getDisplayAmountCents(booking);
          const usesOpsOverride =
            booking.opsGmvCents != null &&
            booking.opsGmvCents > 0 &&
            booking.opsGmvCents !== booking.totalAmountCents;
          return (
            <div className="text-sm">
              <div className="font-semibold tabular-nums text-foreground">
                {formatCentsAsCurrency(amount)}
              </div>
              {usesOpsOverride && (
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ops override
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => {
          const booking = row.original;
          const gmv = getDisplayAmountCents(booking);
          const expenseCents = booking.opsExpenseCents;

          // No expenses recorded yet — admin needs to add them before revenue is meaningful.
          if (expenseCents == null) {
            return (
              <Link
                href={`/admin/bookings/${booking.id}#ops`}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
                title="No expenses entered — add to calculate revenue"
              >
                <Plus className="h-3 w-3" />
                Add expenses
              </Link>
            );
          }

          const revenue = gmv - expenseCents;
          const isNegative = revenue < 0;
          return (
            <div className="text-sm">
              <div
                className={cn(
                  "font-semibold tabular-nums",
                  isNegative
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {formatCentsAsCurrency(revenue)}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "source",
        header: "Source",
        cell: ({ row }) => {
          const booking = row.original;
          const source = getDisplaySource(booking);
          return (
            <div className="text-sm">
              <div className="truncate text-foreground">{source}</div>
              {booking.opsAgentCode && (
                <div className="text-xs text-muted-foreground">{booking.opsAgentCode}</div>
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
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          const adminName =
            booking.assignedAdminFirstName || booking.assignedAdminLastName
              ? `${booking.assignedAdminFirstName || ""} ${booking.assignedAdminLastName || ""}`.trim()
              : booking.assignedAdminEmail || "Unknown";
          return (
            <div className="truncate text-sm font-medium text-foreground">{adminName}</div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const booking = row.original;
          const isPendingRequest =
            booking.bookingType === "REQUEST" && booking.bookingStatus === "PENDING";
          const isLoading = actionLoading === booking.id;

          return (
            // Stop the row click from triggering when admins use the actions menu.
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isLoading}>
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
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/admin/bookings/${booking.id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={isLoading}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Admin
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {admins.length === 0 ? (
                      <DropdownMenuItem disabled>No admins available</DropdownMenuItem>
                    ) : (
                      admins.map((admin) => {
                        const adminName =
                          admin.firstName || admin.lastName
                            ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
                            : admin.email;
                        const isAssigned = booking.assignedAdminId === admin.id;
                        return (
                          <DropdownMenuItem
                            key={admin.id}
                            onClick={() => handleAssignAdmin(booking.id, admin.id)}
                            disabled={isLoading || isAssigned}
                            className={isAssigned ? "opacity-50" : ""}
                          >
                            {adminName}
                            {isAssigned && (
                              <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                            )}
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  onClick={() => handleMarkContacted(booking.id)}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Mark as Contacted
                </DropdownMenuItem>
                {booking.customerEmail && (
                  <DropdownMenuItem asChild>
                    <a href={`mailto:${booking.customerEmail}`} className="cursor-pointer">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </DropdownMenuItem>
                )}
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [
      handleApprove,
      handleDeny,
      handleAssignAdmin,
      handleMarkContacted,
      handleDelete,
      actionLoading,
      admins,
    ]
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {header.isPlaceholder ? null : (
                    <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {table.getRowModel().rows.map((row) => {
            const booking = row.original;
            const colCount = row.getVisibleCells().length;
            return (
              <React.Fragment key={row.id}>
                <tr
                  onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {showOps && (
                  <tr className="border-t-2 border-b-2 border-border bg-muted/30 hover:bg-muted/40">
                    <td
                      colSpan={colCount}
                      className="border-l-2 border-l-primary/30 px-3 py-4"
                    >
                      <OpsRowContent
                        bookingId={booking.id}
                        totalAmountCents={booking.totalAmountCents}
                        opsExpenseCents={booking.opsExpenseCents}
                        opsGmvCents={booking.opsGmvCents}
                        opsPaidCents={booking.opsPaidCents}
                        opsSentToOwnerCents={booking.opsSentToOwnerCents}
                        opsCrewName={booking.opsCrewName}
                        opsContractSigned={booking.opsContractSigned}
                        opsConnected={booking.opsConnected}
                        opsClientPaid={booking.opsClientPaid}
                        opsCaptainPaid={booking.opsCaptainPaid}
                        opsAllPaid={booking.opsAllPaid}
                        opsSheetsSent={booking.opsSheetsSent}
                        opsCommissionAgentCents={booking.opsCommissionAgentCents}
                        opsCommissionKosCents={booking.opsCommissionKosCents}
                        opsCommissionCents={booking.opsCommissionCents}
                        opsSourceOverride={booking.opsSourceOverride}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {pagination.totalPages > 1 && !hidePagination && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.page * pagination.limit - pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} bookings
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
            <span className="text-sm text-foreground px-3">
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
      )}
    </div>
  );
}
