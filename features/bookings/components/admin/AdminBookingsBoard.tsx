"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  CornerDownRight,
  Eye,
  MoreVertical,
  Ship,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type BookingListItem } from "@/features/bookings/booking.types";
import {
  DEAL_SOURCE_LABELS,
  PAYMENT_CHIP,
  SOURCE_BADGE_CLASSES,
} from "@/features/bookings/deal-status";
import { getDealKind } from "@/features/bookings/deal-presentation";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { adminInitials } from "@/shared/lib/utils/people-display";
import { differenceInHours, format } from "date-fns";
import {
  approveBookingRequest,
  assignAdminToBooking,
  denyBookingRequest,
} from "@/features/bookings/actions/admin-booking.actions";
import { useDeleteBooking } from "@/features/bookings/hooks/useBookingMutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface Admin {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username: string | null;
}

interface AdminBookingsBoardProps {
  bookings: BookingListItem[];
  admins?: Admin[];
}

/**
 * The master deals table. Fixed-percentage columns (table-fixed + colgroup)
 * so proportions hold at every viewport and zoom level: identity columns get
 * steady shares, Status gets the widest slice for its key→chip stack, and
 * min-width + overflow keeps zoom usable instead of crushing columns.
 */
const COLUMNS: { key: string; width: string }[] = [
  { key: "type", width: "15%" },
  { key: "customer", width: "17%" },
  { key: "boat", width: "18%" },
  { key: "status", width: "27%" },
  { key: "value", width: "9%" },
  { key: "admin", width: "8%" },
  { key: "actions", width: "6%" },
];

export function AdminBookingsBoard({
  bookings,
  admins = [],
}: AdminBookingsBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteBooking = useDeleteBooking();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const runAction = useCallback(
    async (
      action: () => Promise<{ success: boolean; message?: string; error?: string }>,
      successMessage: string,
      id: string
    ) => {
      setActionLoading(id);
      try {
        const result = await action();
        if (result.success) {
          toast({ title: successMessage, description: result.message });
          router.refresh();
        } else {
          toast({ title: "Error", description: result.error || "Action failed", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Action failed", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast, router]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Delete this deal? This cannot be undone.")) return;
      deleteBooking.mutate(id);
    },
    [deleteBooking]
  );

  if (bookings.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <CalendarCheck className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">No deals found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try a different type, scope, or clear the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[960px] table-fixed caption-bottom text-sm">
          <colgroup>
            {COLUMNS.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="pl-4 text-[11px] font-semibold uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                Boat &amp; date
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider">
                Value
              </TableHead>
              <TableHead className="px-2 text-center text-[11px] font-semibold uppercase tracking-wider">
                Admin
              </TableHead>
              <TableHead className="pr-3" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                admins={admins}
                actionLoading={actionLoading}
                onApprove={(id) => runAction(() => approveBookingRequest(id), "Request approved", id)}
                onDeny={(id) => {
                  const reason = prompt("Reason for denial:");
                  if (!reason?.trim()) return;
                  runAction(() => denyBookingRequest(id, reason), "Request denied", id);
                }}
                onAssign={(id, adminId) =>
                  runAction(() => assignAdminToBooking(id, adminId), "Admin assigned", id)
                }
                onDelete={handleDelete}
                onOpen={(id) => router.push(`/admin/bookings/${id}`)}
              />
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

/** Statuses where a deal no longer needs a working admin. */
const SETTLED_STATUSES = new Set(["CANCELLED", "COMPLETED"]);

/** "Payment?" → badge — one labeled check flag in the Status cell. */
function FlagPair({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      {children}
    </span>
  );
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

function BookingRow({
  booking,
  admins,
  actionLoading,
  onApprove,
  onDeny,
  onAssign,
  onDelete,
  onOpen,
}: {
  booking: BookingListItem;
  admins: Admin[];
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onAssign: (id: string, adminId: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const kind = getDealKind(booking.bookingType);
  const KindIcon = kind.Icon;
  const isInquiry = booking.bookingStatus === "INQUIRY";
  const isLoading = actionLoading === booking.id;
  const isPendingRequest =
    booking.bookingType === "REQUEST" && booking.bookingStatus === "PENDING";
  const isLive = !booking.archivedAt && !SETTLED_STATUSES.has(booking.bookingStatus);
  const isNew = differenceInHours(new Date(), new Date(booking.createdAt)) < 48;

  // Origin — the one discriminator new admins need, worn as a colored badge.
  const origin =
    booking.source === "ADMIN"
      ? "Admin created"
      : booking.source
        ? (DEAL_SOURCE_LABELS[booking.source] ?? null)
        : null;
  const originClasses =
    SOURCE_BADGE_CLASSES[booking.source ?? ""] ?? SOURCE_BADGE_CLASSES.OTHER;

  // Trip / requested date
  let dateLine = "No date yet";
  let timeLine = "";
  if (booking.startDateTime) {
    const { date: sd, time: st } = parseDateTimeInBoatTimezone(booking.startDateTime);
    const { time: et } = booking.endDateTime
      ? parseDateTimeInBoatTimezone(booking.endDateTime)
      : { time: "" };
    dateLine = sd ? format(sd, "EEE, MMM d, yyyy") : "—";
    timeLine = `${st ? formatTime12Hour(st) : ""}${et ? ` – ${formatTime12Hour(et)}` : ""}`;
  } else if (booking.preferredDate) {
    dateLine = `${format(new Date(`${booking.preferredDate}T00:00:00`), "EEE, MMM d, yyyy")}`;
    timeLine = "requested";
  }

  // Status stack lines. Payment only once an invoice could exist — a lead or
  // an unreviewed request showing "Unpaid" is noise, money already in always shows.
  const paymentChip =
    booking.paymentDisplayStatus && PAYMENT_CHIP[booking.paymentDisplayStatus]
      ? PAYMENT_CHIP[booking.paymentDisplayStatus]
      : null;
  const showPayment =
    paymentChip != null &&
    (["DRAFT", "APPROVED", "CONFIRMED", "COMPLETED"].includes(booking.bookingStatus) ||
      booking.totalPaidCents > 0 ||
      booking.hasRefund);
  const showCaptain =
    Boolean(booking.needsCaptain) &&
    (booking.bookingStatus === "APPROVED" || booking.bookingStatus === "CONFIRMED");
  const captainAssigned = Boolean(booking.captainUserId);
  // Contract matters once the deal is locked in (approved onward).
  const showContract = ["APPROVED", "CONFIRMED", "COMPLETED"].includes(booking.bookingStatus);
  const unassigned = !booking.assignedAdminId && isLive;

  // Value: GMV for real bookings, estimate/budget for inquiries
  const estimateCents = booking.estimatedValueCents ?? booking.budgetCents;
  const valueCents = isInquiry
    ? estimateCents
    : booking.opsGmvCents && booking.opsGmvCents > 0
      ? booking.opsGmvCents
      : booking.totalAmountCents;

  const customerName = booking.customerName || booking.userEmail || "Unknown";
  const adminName = booking.assignedAdminId
    ? [booking.assignedAdminFirstName, booking.assignedAdminLastName].filter(Boolean).join(" ").trim() ||
      booking.assignedAdminEmail ||
      "Admin"
    : null;

  return (
    <TableRow
      onClick={() => onOpen(booking.id)}
      className={cn("group cursor-pointer border-border/50", kind.rowHover)}
    >
      {/* Type — carries the colored kind rail + origin badge */}
      <TableCell className="relative py-3 pl-4 align-top">
        <span className={cn("absolute inset-y-0 left-0 w-1", kind.rail)} aria-hidden />
        <div className="flex items-start gap-2.5">
          <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", kind.iconWrap)}>
            <KindIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/admin/bookings/${booking.id}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate text-sm font-semibold text-foreground"
              >
                {kind.label}
              </Link>
              {isNew ? (
                <span className="rounded-full bg-primary-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-primary-strong">
                  New
                </span>
              ) : null}
            </div>
            {origin ? (
              <div className="mt-1 flex items-center gap-1">
                <CornerDownRight className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden />
                <span
                  className={cn(
                    "truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                    originClasses
                  )}
                >
                  {origin}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* Customer */}
      <TableCell className="py-3 align-top">
        <div className="truncate text-sm font-medium text-foreground">{customerName}</div>
        {booking.customerEmail ? (
          <CopyableText value={booking.customerEmail} label="email" className="mt-0.5 max-w-full" />
        ) : null}
      </TableCell>

      {/* Boat & date */}
      <TableCell className="py-3 align-top">
        <div className="flex items-center gap-1.5 text-sm">
          <Ship className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">
            {booking.boatName ?? <span className="font-normal text-muted-foreground/60">No boat yet</span>}
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs tabular-nums text-muted-foreground">
          {dateLine}
          {timeLine ? <span className="text-muted-foreground/70"> · {timeLine}</span> : null}
        </div>
      </TableCell>

      {/* Status — the booking's check flags: labeled question → answer badge.
          Horizontal, wraps in twos. The row-level cousin of the pre-booking
          checklist on the detail page. */}
      <TableCell className="py-3 align-top">
        {showPayment || showCaptain || showContract || booking.coldAt ? (
          <div className="flex max-w-[19rem] flex-wrap items-center gap-x-3 gap-y-1.5">
            {showPayment && paymentChip ? (
              <FlagPair label="Payment">
                <Chip className={paymentChip.className}>{paymentChip.label}</Chip>
              </FlagPair>
            ) : null}
            {showCaptain ? (
              <FlagPair label="Captain">
                <Chip
                  className={
                    captainAssigned
                      ? "bg-success-soft text-success"
                      : "bg-destructive-soft text-destructive"
                  }
                >
                  {captainAssigned ? "Assigned" : "Needed"}
                </Chip>
              </FlagPair>
            ) : null}
            {showContract ? (
              <FlagPair label="Contract">
                <Chip
                  className={
                    booking.opsContractSigned
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning"
                  }
                >
                  {booking.opsContractSigned ? "Signed" : "Unsigned"}
                </Chip>
              </FlagPair>
            ) : null}
            {booking.coldAt ? (
              <Chip className="bg-sky-500/10 font-medium text-sky-700 dark:text-sky-400">Cold</Chip>
            ) : null}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Value */}
      <TableCell className="py-3 pr-1 text-right align-top text-sm">
        {valueCents != null && valueCents > 0 ? (
          <span className="whitespace-nowrap font-semibold tabular-nums text-foreground">
            {isInquiry ? (
              <span className="mr-1 text-[10px] font-medium text-muted-foreground">est.</span>
            ) : null}
            {formatCentsAsCurrency(valueCents, { currency: booking.currency ?? "USD" })}
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Assigned admin — "Unassigned" lives HERE, not in status */}
      <TableCell className="px-2 py-3 text-center align-top">
        {adminName ? (
          <span
            title={adminName}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-foreground"
          >
            {adminInitials(adminName) || "?"}
          </span>
        ) : unassigned ? (
          <Chip className="bg-destructive-soft text-destructive">Unassigned</Chip>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell
        className="py-3 pr-3 text-right align-top"
        onClick={(e) => e.stopPropagation()}
      >
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
            {isPendingRequest ? (
              <>
                <DropdownMenuItem
                  onClick={() => onApprove(booking.id)}
                  disabled={isLoading}
                  className="cursor-pointer text-success"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeny(booking.id)}
                  disabled={isLoading}
                  className="cursor-pointer text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Deny
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem onClick={() => onOpen(booking.id)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Open deal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isLoading}>
                <UserCheck className="mr-2 h-4 w-4" />
                Assign admin
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {admins.length === 0 ? (
                  <DropdownMenuItem disabled>No admins available</DropdownMenuItem>
                ) : (
                  admins.map((admin) => {
                    const name =
                      [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() || admin.email;
                    const isAssigned = booking.assignedAdminId === admin.id;
                    return (
                      <DropdownMenuItem
                        key={admin.id}
                        onClick={() => onAssign(booking.id, admin.id)}
                        disabled={isLoading || isAssigned}
                        className={isAssigned ? "opacity-50" : ""}
                      >
                        {name}
                        {isAssigned ? <CheckCircle2 className="ml-auto h-4 w-4 text-success" /> : null}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(booking.id)}
              className="cursor-pointer text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function CopyableText({ value, label, className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      title={copied ? "Copied!" : `Copy ${label ?? value}`}
      className={cn(
        "group/copy relative z-10 inline-flex max-w-full items-center gap-1 rounded-md px-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
        className
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
