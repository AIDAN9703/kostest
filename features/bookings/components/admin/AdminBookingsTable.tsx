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
import type { MasterDealRow } from "@/features/bookings/services/master-deals.service";
import {
  DEAL_KIND_LABELS,
  DEAL_STATUS_CHIP_CLASSES,
  DEAL_STATUS_LABELS,
} from "@/features/bookings/deal-status";
import { STAGE_LABELS } from "@/features/inquiries/inquiry-ui";
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
  rows: MasterDealRow[];
  loading?: boolean;
  admins?: Admin[];
  captains?: CaptainAssignmentOption[];
}

const columnHelper = createColumnHelper<MasterDealRow>();

/**
 * Content-hugging column (w-0) — ONLY for the trailing icon/actions column.
 * Data columns must stay auto-width so the browser distributes leftover
 * table width proportionally across all of them; pinning them with w-0
 * forces the slack into whichever column is left, which reads as a giant
 * gap at wide viewports / zoomed-out windows.
 */
const shrinkColumnMeta = {
  headerClassName: "w-0",
  cellClassName: "w-0",
} as const;

export function AdminBookingsTable({
  rows,
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

  const columns = useMemo<ColumnDef<MasterDealRow, any>[]>(
    () => [
      columnHelper.display({
        id: "date",
        header: "Date",
        cell: ({ row }) => {
          const deal = row.original;
          // Red badges = things an admin must act on, right where the eye lands.
          const attention: string[] = [];
          let dateLine: string;
          let timeLine = "";
          if (deal.kind === "lead") {
            dateLine = deal.lead.tripStart
              ? format(deal.lead.tripStart, "MMM d, yyyy")
              : "No date yet";
            if (!deal.lead.assignedToId && deal.lead.outcome === "OPEN") {
              attention.push("Unassigned");
            }
          } else {
            const booking = deal.booking;
            const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(
              booking.startDateTime
            );
            const { time: endTime } = booking.endDateTime
              ? parseDateTimeInBoatTimezone(booking.endDateTime)
              : { time: "" };
            dateLine = startDate ? format(startDate, "MMM d, yyyy") : "—";
            timeLine = `${startTime ? formatTime12Hour(startTime) : ""}${
              endTime ? ` – ${formatTime12Hour(endTime)}` : ""
            }`;
            if (
              booking.needsCaptain &&
              !booking.captainUserId &&
              (booking.bookingStatus === "APPROVED" || booking.bookingStatus === "CONFIRMED")
            ) {
              attention.push("Assign captain");
            }
          }
          return (
            <div className="text-sm leading-snug">
              <div className="whitespace-nowrap font-medium tabular-nums text-foreground">
                {dateLine}
              </div>
              {timeLine ? (
                <div className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                  {timeLine}
                </div>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    DEAL_STATUS_CHIP_CLASSES[deal.dealStatus]
                  )}
                >
                  {DEAL_STATUS_LABELS[deal.dealStatus]}
                </span>
                {deal.kind === "lead" && deal.dealStatus === "INQUIRY" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {STAGE_LABELS[deal.lead.stage] ?? deal.lead.stage}
                  </span>
                ) : null}
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
      columnHelper.display({
        id: "customer",
        header: "Customer",
        // Stretch: customer + boat share the table's leftover width so the
        // right-side columns don't drift away from their content.
        cell: ({ row }) => {
          const deal = row.original;
          const customer =
            deal.kind === "lead"
              ? {
                  name: deal.lead.name,
                  email: deal.lead.email,
                  phone: deal.lead.phone,
                  image: null as string | null,
                }
              : {
                  name: deal.booking.customerName || deal.booking.userEmail || "Unknown",
                  email: deal.booking.customerEmail,
                  phone: deal.booking.customerPhone,
                  image: deal.booking.userProfileImage,
                };
          const displayName = customer.name || "Unknown";
          return (
            <div className="flex items-center gap-1.5">
              <div className="hidden h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60 sm:block">
                {customer.image ? (
                  <Image
                    src={customer.image}
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
                {customer.email ? (
                  <CopyableText
                    value={customer.email}
                    label="email"
                    className="mt-0.5 hidden w-full lg:inline-flex"
                  />
                ) : null}
                {customer.phone ? (
                  <CopyableText
                    value={customer.phone}
                    label="phone"
                    className="hidden w-full xl:inline-flex"
                  />
                ) : null}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "boat",
        header: "Boat",
        cell: ({ row }) => {
          const deal = row.original;
          if (deal.kind === "lead") {
            return (
              <div className="flex items-center gap-1.5">
                <span className="block max-w-[22rem] truncate text-sm font-medium text-foreground">
                  {deal.lead.boatName ?? (
                    <span className="font-normal text-muted-foreground/60">No boat yet</span>
                  )}
                </span>
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {DEAL_KIND_LABELS[deal.lead.leadType] ?? deal.lead.leadType}
                </span>
              </div>
            );
          }
          const booking = deal.booking;
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
        cell: ({ row }) => {
          const deal = row.original;
          if (deal.kind === "lead") {
            return <span className="text-sm text-muted-foreground/50">—</span>;
          }
          const booking = deal.booking;
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
      columnHelper.display({
        id: "gmv",
        header: "GMV",
        cell: ({ row }) => {
          const deal = row.original;
          if (deal.kind === "lead") {
            const est = deal.lead.estimatedTotalCents;
            return (
              <div className="whitespace-nowrap text-sm">
                {est != null ? (
                  <div className="font-semibold tabular-nums text-foreground">
                    {formatCentsAsCurrency(est)}
                  </div>
                ) : deal.lead.budget ? (
                  <div className="font-medium text-muted-foreground">{deal.lead.budget}</div>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </div>
            );
          }
          const booking = deal.booking;
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
        cell: ({ row }) => {
          const deal = row.original;
          if (deal.kind === "lead") {
            return <span className="text-sm text-muted-foreground/50">—</span>;
          }
          const booking = deal.booking;
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
        cell: ({ row }) => {
          const deal = row.original;
          const adminName =
            deal.kind === "lead"
              ? deal.lead.assignedToName
              : deal.booking.assignedAdminId
                ? deal.booking.assignedAdminFirstName || deal.booking.assignedAdminLastName
                  ? `${deal.booking.assignedAdminFirstName || ""} ${deal.booking.assignedAdminLastName || ""}`.trim()
                  : deal.booking.assignedAdminEmail || "Unknown"
                : null;
          if (!adminName) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
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
          const deal = row.original;
          if (deal.kind === "lead") {
            // Leads keep it simple: the whole row opens the unified detail
            // page where claim/assign/proposal actions live.
            return (
              <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Link href={`/admin/bookings/${deal.id}`} aria-label="View lead">
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          }
          const booking = deal.booking;
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
        data={rows}
        columns={columns}
        columnVisibility={columnVisibility}
        loading={loading}
        loadingLabel="Loading bookings…"
        emptyIcon={CalendarCheck}
        emptyTitle="No bookings found"
        emptyDescription="Try adjusting your filters or check back later."
        onRowClick={(deal) => router.push(`/admin/bookings/${deal.id}`)}
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
