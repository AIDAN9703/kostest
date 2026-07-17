"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
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
  CalendarCheck,
  Eye,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  UserCheck,
  Plus,
  Copy,
  Check,
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
} from "@/features/bookings/actions/admin-booking.actions";
import { useDeleteBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { BookingExpensesModal } from "./BookingExpensesModal";
import {
  OpsCaptainAssignment,
  type CaptainAssignmentOption,
} from "@/features/bookings/components/admin/OpsCaptainAssignment";
import { computeOpsRevenueCents } from "@/shared/lib/utils/ops-revenue";
import { AdminDataTable } from "@/shared/admin/components/AdminDataTable";
import { useMediaQuery } from "@/shared/lib/hooks/use-media-query";

const tableInlineActionClass =
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-dashed border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground";

/** Use ops GMV when admins have set it; otherwise fall back to the quote total. */
function getDisplayAmountCents(b: BookingListItem): number {
  if (b.opsGmvCents != null && b.opsGmvCents > 0) return b.opsGmvCents;
  return b.totalAmountCents ?? 0;
}

interface CopyableTextProps {
  value: string;
  label?: string;
  className?: string;
}

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
      /* clipboard blocked */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label ?? value}`}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label ?? value}`}
      className={cn(
        "group/copy inline-flex max-w-full items-center gap-1 rounded-md px-0.5 py-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
        className,
      )}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-success" />
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
  loading?: boolean;
  admins?: Admin[];
  captains?: CaptainAssignmentOption[];
}

const columnHelper = createColumnHelper<BookingListItem>();

/** Full-width tables stretch columns by default; w-0 hugs content instead of leaving dead space. */
const shrinkColumnMeta = {
  headerClassName: "w-0",
  cellClassName: "w-0",
} as const;

export function AdminBookingsTable({
  bookings,
  loading = false,
  admins: adminsProp = [],
  captains: captainsProp = [],
}: AdminBookingsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteBooking = useDeleteBooking();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expensesModalBooking, setExpensesModalBooking] = useState<BookingListItem | null>(null);

  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");

  const columnVisibility = useMemo<VisibilityState>(
    () => ({
      captain: isLg,
      assignedAdmin: isLg,
      source: isXl,
    }),
    [isLg, isXl],
  );

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

  const columns = useMemo<ColumnDef<BookingListItem, any>[]>(
    () => [
      columnHelper.accessor("startDateTime", {
        id: "date",
        header: "Date",
        meta: shrinkColumnMeta,
        cell: ({ row }) => {
          const booking = row.original;
          const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(
            booking.startDateTime
          );
          const { time: endTime } = booking.endDateTime
            ? parseDateTimeInBoatTimezone(booking.endDateTime)
            : { time: "" };
          const isCancelled = booking.bookingStatus === "CANCELLED";
          const isPaid = booking.paymentDisplayStatus === "PAID";
          // Red badges = things an admin must act on, right where the eye lands.
          const attention: string[] = [];
          if (
            booking.needsCaptain &&
            !booking.captainUserId &&
            (booking.bookingStatus === "APPROVED" || booking.bookingStatus === "CONFIRMED")
          ) {
            attention.push("Assign captain");
          }
          return (
            <div className="text-sm leading-snug">
              <div className="whitespace-nowrap font-medium tabular-nums text-foreground">
                {startDate ? format(startDate, "MMM d, yyyy") : "—"}
              </div>
              <div className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                {startTime ? formatTime12Hour(startTime) : ""}
                {endTime ? ` – ${formatTime12Hour(endTime)}` : ""}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {isCancelled ? (
                  <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    Cancelled
                  </span>
                ) : (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isPaid ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isPaid ? "Paid" : "Unpaid"}
                  </span>
                )}
                {attention.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-destructive-soft px-2 py-0.5 text-[10px] font-semibold text-destructive"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        // Stretch: customer + boat share the table's leftover width so the
        // right-side columns don't drift away from their content.
        cell: ({ row }) => {
          const booking = row.original;
          const displayName = booking.customerName || booking.userEmail || "Unknown";
          return (
            <div className="flex items-center gap-1.5">
              <div className="hidden h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60 sm:block">
                {booking.userProfileImage ? (
                  <Image
                    src={booking.userProfileImage}
                    alt={displayName}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/15 text-xs font-medium text-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 max-w-[22rem]">
                <div className="truncate text-sm font-medium leading-tight text-foreground">
                  {displayName}
                </div>
                {booking.customerEmail ? (
                  <CopyableText
                    value={booking.customerEmail}
                    label="email"
                    className="mt-0.5 hidden w-full lg:inline-flex"
                  />
                ) : null}
                {booking.customerPhone ? (
                  <CopyableText
                    value={booking.customerPhone}
                    label="phone"
                    className="hidden w-full xl:inline-flex"
                  />
                ) : null}
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
            <div className="flex items-center gap-1.5">
              {booking.boatMainImage ? (
                <div className="hidden h-7 w-7 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/60 md:block">
                  <Image
                    src={booking.boatMainImage}
                    alt={booking.boatName || "Boat"}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <span className="block max-w-[22rem] truncate text-sm font-medium text-foreground">
                {booking.boatName || "Unknown"}
              </span>
              {booking.bookingGroupId ? (
                <span className="shrink-0 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  Group
                </span>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "captain",
        header: "Captain",
        meta: shrinkColumnMeta,
        cell: ({ row }) => {
          const booking = row.original;
          const captainOptions = [...captainsProp];
          if (
            booking.captainUserId &&
            !captainOptions.some((c) => c.id === booking.captainUserId)
          ) {
            captainOptions.unshift({
              id: booking.captainUserId,
              firstName: booking.captainFirstName,
              lastName: booking.captainLastName,
              email: booking.captainEmail ?? "",
            });
          }
          return (
            <OpsCaptainAssignment
              compact
              bookingId={booking.id}
              captainUserId={booking.captainUserId}
              captainFirstName={booking.captainFirstName}
              captainLastName={booking.captainLastName}
              captainEmail={booking.captainEmail}
              captainOptions={captainOptions}
            />
          );
        },
      }),
      columnHelper.accessor("totalAmountCents", {
        header: "GMV",
        meta: shrinkColumnMeta,
        cell: ({ row }) => {
          const booking = row.original;
          const amount = getDisplayAmountCents(booking);
          const usesOpsOverride =
            booking.opsGmvCents != null &&
            booking.opsGmvCents > 0 &&
            booking.opsGmvCents !== booking.totalAmountCents;
          return (
            <div className="whitespace-nowrap text-sm">
              <div className="font-semibold tabular-nums text-foreground">
                {formatCentsAsCurrency(amount, { currency: booking.currency ?? "USD" })}
              </div>
              {usesOpsOverride && (
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Override
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "revenue",
        header: "Revenue",
        meta: shrinkColumnMeta,
        cell: ({ row }) => {
          const booking = row.original;
          const expenseCents = booking.opsExpenseCents;

          if (expenseCents == null) {
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpensesModalBooking(booking);
                }}
                className={tableInlineActionClass}
                title="Add expenses to calculate revenue"
              >
                <Plus className="h-3 w-3 shrink-0" />
                Add
              </button>
            );
          }

          const revenue = computeOpsRevenueCents(
            booking.opsGmvCents,
            booking.totalAmountCents,
            expenseCents
          );
          const isNegative = revenue != null && revenue < 0;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpensesModalBooking(booking);
              }}
              className="whitespace-nowrap text-left text-sm transition-colors hover:opacity-80"
              title="Edit expense breakdown"
            >
              <div
                className={cn(
                  "font-semibold tabular-nums whitespace-nowrap",
                  isNegative
                    ? "text-destructive"
                    : "text-success"
                )}
              >
                {revenue != null
                  ? formatCentsAsCurrency(revenue, { currency: booking.currency ?? "USD" })
                  : "—"}
              </div>
            </button>
          );
        },
      }),
      columnHelper.display({
        id: "assignedAdmin",
        header: "Admin",
        meta: shrinkColumnMeta,
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
            <span className="block max-w-[12rem] truncate whitespace-nowrap text-sm font-medium text-foreground">
              {adminName}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        enableHiding: false,
        meta: shrinkColumnMeta,
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
                        className="text-success cursor-pointer"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeny(booking.id)}
                        disabled={isLoading}
                        className="text-destructive cursor-pointer"
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
                                <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                              )}
                            </DropdownMenuItem>
                          );
                        })
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(booking.id)}
                      className="text-destructive cursor-pointer"
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
      handleDelete,
      actionLoading,
      admins,
      captainsProp,
      setExpensesModalBooking,
    ]
  );

  return (
    <>
      <AdminDataTable
        data={bookings}
        columns={columns}
        columnVisibility={columnVisibility}
        loading={loading}
        loadingLabel="Loading bookings…"
        emptyIcon={CalendarCheck}
        emptyTitle="No bookings found"
        emptyDescription="Try adjusting your filters or check back later."
        onRowClick={(booking) => router.push(`/admin/bookings/${booking.id}`)}
      />

      {expensesModalBooking ? (
        <BookingExpensesModal
          open={!!expensesModalBooking}
          onOpenChange={(open) => {
            if (!open) setExpensesModalBooking(null);
          }}
          bookingId={expensesModalBooking.id}
          totalAmountCents={expensesModalBooking.totalAmountCents}
          opsGmvCents={expensesModalBooking.opsGmvCents}
          currency={expensesModalBooking.currency ?? "USD"}
        />
      ) : null}
    </>
  );
}
