"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Anchor,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Eye,
  FileCheck2,
  FileX2,
  MoreVertical,
  Plus,
  RotateCcw,
  Ship,
  Trash2,
  UserCheck,
  type LucideIcon,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { type BookingListItem } from "@/features/bookings/booking.types";
import {
  DEAL_SOURCE_LABELS,
  isTripImminent,
  PRETRIP_URGENT_HOURS,
  SOURCE_BADGE_CLASSES,
} from "@/features/bookings/deal-status";
import { getDisplayKind, PRICED_STATUSES } from "@/features/bookings/deal-presentation";
import { BookingExpensesModal } from "@/features/bookings/components/admin/BookingExpensesModal";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { adminInitials } from "@/shared/lib/utils/people-display";
import { differenceInHours, format } from "date-fns";
import {
  assignAdminToBooking,
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
 * so proportions hold at every viewport and zoom. The Type column carries the
 * at-a-glance state as hoverable color-coded emblems; the middle is the money
 * read the owners run on (GMV → expense → revenue → commission); ownership
 * meta (admin, source) sits on the right edge. Widths are sized to content so
 * spare screen width flows into the readable columns (customer, boat, date),
 * not into padding around badges.
 */
const COLUMNS: { key: string; width: string }[] = [
  { key: "type", width: "12%" },
  { key: "customer", width: "15%" },
  { key: "boat", width: "12%" },
  { key: "datetime", width: "10%" },
  { key: "gmv", width: "8%" },
  { key: "expense", width: "7%" },
  { key: "revenue", width: "7%" },
  { key: "commission", width: "9%" },
  { key: "admin", width: "6%" },
  { key: "source", width: "9%" },
  { key: "actions", width: "5%" },
];

const HEAD_CLASS = "text-[11px] font-semibold uppercase tracking-wider";

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
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1180px] table-fixed caption-bottom text-sm">
            <colgroup>
              {COLUMNS.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className={cn(HEAD_CLASS, "pl-4")}>Type</TableHead>
                <TableHead className={HEAD_CLASS}>Customer</TableHead>
                <TableHead className={HEAD_CLASS}>Boat</TableHead>
                <TableHead className={HEAD_CLASS}>Date &amp; time</TableHead>
                <TableHead className={cn(HEAD_CLASS, "text-right")}>GMV</TableHead>
                <TableHead className={cn(HEAD_CLASS, "text-right")}>Expense</TableHead>
                <TableHead className={cn(HEAD_CLASS, "text-right")}>Revenue</TableHead>
                <TableHead className={cn(HEAD_CLASS, "pr-6 text-right")}>Comm.</TableHead>
                <TableHead className={cn(HEAD_CLASS, "px-2 text-center")}>Admin</TableHead>
                <TableHead className={cn(HEAD_CLASS, "pl-4")}>Source</TableHead>
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
    </TooltipProvider>
  );
}

/** Statuses where a deal no longer needs a working admin. */
const SETTLED_STATUSES = new Set(["CANCELLED", "COMPLETED"]);

interface EmblemSpec {
  label: string;
  className: string;
  Icon: LucideIcon;
  /** Diagonal strike through the icon (e.g. unpaid $). */
  slash?: boolean;
}

/** Payment emblem per computed display status: green paid, yellow partial, red slashed unpaid. */
const PAYMENT_EMBLEMS: Record<string, EmblemSpec> = {
  PAID: { label: "Payment: paid in full", className: "bg-success-soft text-success", Icon: DollarSign },
  DEPOSIT_PAID: { label: "Payment: partial", className: "bg-warning-soft text-warning", Icon: DollarSign },
  UNPAID: { label: "Payment: unpaid", className: "bg-destructive-soft text-destructive", Icon: DollarSign, slash: true },
  PROCESSING: { label: "Payment: processing", className: "bg-sky-500/10 text-sky-400", Icon: Clock },
  REFUNDED: { label: "Payment: refunded", className: "bg-orange-500/10 text-orange-400", Icon: RotateCcw },
  CHARGEBACK: { label: "Payment: chargeback", className: "bg-orange-500/10 text-orange-400", Icon: AlertTriangle },
  FAILED: { label: "Payment: failed", className: "bg-destructive-soft text-destructive", Icon: AlertTriangle },
};

/**
 * Tone for a pre-trip requirement emblem (captain, contract): green when
 * resolved, yellow while pending, red once the trip is inside the
 * PRETRIP_URGENT_HOURS window with the item still open.
 */
function preTripTone(done: boolean, tripImminent: boolean): string {
  if (done) return "bg-success-soft text-success";
  return tripImminent
    ? "bg-destructive-soft text-destructive"
    : "bg-warning-soft text-warning";
}

function preTripLabel(item: string, state: string, urgent: boolean): string {
  return `${item} ${state}${urgent ? ` — trip inside ${PRETRIP_URGENT_HOURS}h` : ""}`;
}

/** One hoverable color-coded status emblem in the Type column. */
function StatusEmblem({ label, className, Icon, slash }: EmblemSpec) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full",
            className
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {slash ? (
            <span className="absolute h-8 w-px rotate-45 bg-current" aria-hidden />
          ) : null}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/** Right-aligned money value; em-dash when there's nothing to show. */
function MoneyCell({
  cents,
  currency,
  estimate = false,
  sub,
  className,
  strong = false,
  signed = false,
}: {
  cents: number | null | undefined;
  currency: string;
  /** Prefixes "est." — inquiry money is a guess, not booked revenue. */
  estimate?: boolean;
  sub?: string | null;
  className?: string;
  /** Bigger + bolder — for the number the row is really about. */
  strong?: boolean;
  /** Color by sign: green in the black, red in the red. */
  signed?: boolean;
}) {
  return (
    <TableCell className={cn("py-3 pr-1 text-right align-top text-sm", className)}>
      {cents != null && cents !== 0 ? (
        <>
          <span
            className={cn(
              "whitespace-nowrap tabular-nums",
              strong ? "text-[15px] font-bold" : "font-semibold",
              signed ? (cents > 0 ? "text-success" : "text-destructive") : "text-foreground"
            )}
          >
            {estimate ? (
              <span className="mr-1 text-[10px] font-medium text-muted-foreground">est.</span>
            ) : null}
            {formatCentsAsCurrency(cents, { currency })}
          </span>
          {sub ? (
            <div className="mt-0.5 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground">
              {sub}
            </div>
          ) : null}
        </>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      )}
    </TableCell>
  );
}

/**
 * Expense column cell: shows the total once expenses exist; before that, real
 * bookings get an inline "+ Add" that opens the expense tracker right from
 * the row (inquiries just show the dash — nothing to expense yet).
 */
function ExpenseCell({ booking, currency }: { booking: BookingListItem; currency: string }) {
  const [open, setOpen] = useState(false);
  // Mount the modal only after first use — not 25 hidden dialogs per page.
  const [mounted, setMounted] = useState(false);

  if (booking.opsExpenseCents) {
    return <MoneyCell cents={booking.opsExpenseCents} currency={currency} />;
  }

  const canTrack = PRICED_STATUSES.has(booking.bookingStatus);
  return (
    <TableCell
      className="py-3 pr-1 text-right align-top text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {canTrack ? (
        <>
          <button
            type="button"
            onClick={() => {
              setMounted(true);
              setOpen(true);
            }}
            className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
          {mounted ? (
            <BookingExpensesModal
              open={open}
              onOpenChange={setOpen}
              bookingId={booking.id}
              totalAmountCents={booking.totalAmountCents}
              serviceFeeCents={booking.serviceFeeCents}
              opsGmvCents={booking.opsGmvCents ?? null}
              currency={currency}
            />
          ) : null}
        </>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      )}
    </TableCell>
  );
}

function BookingRow({
  booking,
  admins,
  actionLoading,
  onAssign,
  onDelete,
  onOpen,
}: {
  booking: BookingListItem;
  admins: Admin[];
  actionLoading: string | null;
  onAssign: (id: string, adminId: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const kind = getDisplayKind(booking);
  const KindIcon = kind.Icon;
  const isInquiry = booking.bookingStatus === "INQUIRY";
  const isLoading = actionLoading === booking.id;
  const isLive = !booking.archivedAt && !SETTLED_STATUSES.has(booking.bookingStatus);
  const isNew = differenceInHours(new Date(), new Date(booking.createdAt)) < 48;
  // One boat of a multi-boat charter party.
  const isParty = !!booking.bookingGroupId && (booking.bookingGroupSize ?? 0) > 1;
  const currency = booking.currency ?? "USD";

  // Trip / requested date
  let dateLine: string | null = null;
  let timeLine = "";
  if (booking.startDateTime) {
    // Boat-local — a Nassau/Chicago boat must not read as New York.
    const boatTz = { timezone: booking.boatTimezone };
    const { date: sd, time: st } = parseDateTimeInBoatTimezone(booking.startDateTime, boatTz);
    const { time: et } = booking.endDateTime
      ? parseDateTimeInBoatTimezone(booking.endDateTime, boatTz)
      : { time: "" };
    dateLine = sd ? format(sd, "EEE, MMM d, yyyy") : "—";
    timeLine = `${st ? formatTime12Hour(st) : ""}${et ? ` – ${formatTime12Hour(et)}` : ""}`;
  } else if (booking.preferredDate) {
    dateLine = `${format(new Date(`${booking.preferredDate}T00:00:00`), "EEE, MMM d, yyyy")}`;
    timeLine = "requested";
  }

  // Status emblems — payment once an invoice could exist (or money moved),
  // captain/contract once the deal is locked in.
  const paymentEmblem =
    (PRICED_STATUSES.has(booking.bookingStatus) ||
      booking.totalPaidCents > 0 ||
      booking.hasRefund) &&
    booking.paymentDisplayStatus
      ? PAYMENT_EMBLEMS[booking.paymentDisplayStatus]
      : null;
  const showCaptain =
    Boolean(booking.needsCaptain) &&
    (booking.bookingStatus === "APPROVED" || booking.bookingStatus === "CONFIRMED");
  const showContract = ["APPROVED", "CONFIRMED", "COMPLETED"].includes(booking.bookingStatus);
  // Unresolved pre-trip items are pending (yellow) until the trip is inside
  // the urgency window, then red — see PRETRIP_URGENT_HOURS in deal-status.
  const tripImminent = isTripImminent(booking.startDateTime);
  const unassigned = !booking.assignedAdminId && isLive;

  // Money: GMV falls back to the charter total; inquiries show their estimate.
  const gmvCents = isInquiry
    ? (booking.estimatedValueCents ?? booking.budgetCents)
    : booking.opsGmvCents && booking.opsGmvCents > 0
      ? booking.opsGmvCents
      : booking.totalAmountCents;
  const commissionSplit =
    booking.opsCommissionAgentCents || booking.opsCommissionKosCents
      ? [
          booking.opsCommissionAgentCents
            ? `A ${formatCentsAsCurrency(booking.opsCommissionAgentCents, { currency })}`
            : null,
          booking.opsCommissionKosCents
            ? `K ${formatCentsAsCurrency(booking.opsCommissionKosCents, { currency })}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

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
      {/* Deal — type + hoverable status emblems, one glance for the row's state */}
      <TableCell className="relative py-3 pl-4 align-top">
        <span className={cn("absolute inset-y-0 left-0 w-1", kind.rail)} aria-hidden />
        <div className="flex items-start gap-2.5">
          <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", kind.iconWrap)}>
            <KindIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/bookings/${booking.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-semibold text-foreground"
            >
              {kind.label}
            </Link>
            {paymentEmblem || showCaptain || showContract ? (
              <div className="mt-1.5 flex items-center gap-1">
                {paymentEmblem ? <StatusEmblem {...paymentEmblem} /> : null}
                {showCaptain ? (
                  <StatusEmblem
                    label={preTripLabel("Captain", booking.captainUserId ? "assigned" : "needed", !booking.captainUserId && tripImminent)}
                    className={preTripTone(Boolean(booking.captainUserId), tripImminent)}
                    Icon={Anchor}
                  />
                ) : null}
                {showContract ? (
                  <StatusEmblem
                    label={preTripLabel("Contract", booking.opsContractSigned ? "signed" : "unsigned", !booking.opsContractSigned && tripImminent)}
                    className={preTripTone(Boolean(booking.opsContractSigned), tripImminent)}
                    Icon={booking.opsContractSigned ? FileCheck2 : FileX2}
                  />
                ) : null}
              </div>
            ) : null}
            {/* Badges sit under the emblems: freshness, then charter party. */}
            {isNew || isParty ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {isNew ? (
                  <span className="rounded-full bg-primary-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-primary-strong">
                    New
                  </span>
                ) : null}
                {isParty ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-violet-300"
                    title={booking.bookingGroupName ?? "Charter party"}
                  >
                    <Ship className="h-2.5 w-2.5" />
                    ×{booking.bookingGroupSize} party
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </TableCell>

      {/* Customer — name + copyable email and phone */}
      <TableCell className="py-3 align-top">
        <div className="truncate text-sm font-medium text-foreground">{customerName}</div>
        {/* Each contact line in its own block so phone always stacks under email. */}
        {booking.customerEmail ? (
          <div className="mt-0.5">
            <CopyableText value={booking.customerEmail} label="email" className="max-w-full" />
          </div>
        ) : null}
        {booking.customerPhone ? (
          <div>
            <CopyableText value={booking.customerPhone} label="phone" className="max-w-full" />
          </div>
        ) : null}
      </TableCell>

      {/* Boat */}
      <TableCell className="py-3 align-top">
        <div className="flex items-center gap-1.5 text-sm">
          <Ship className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground" title={booking.boatName ?? undefined}>
            {booking.boatName ?? <span className="font-normal text-muted-foreground/60">No boat yet</span>}
          </span>
        </div>
      </TableCell>

      {/* Date & time — date on top, time below */}
      <TableCell className="py-3 align-top">
        {dateLine ? (
          <>
            <div className="truncate text-sm tabular-nums text-foreground">{dateLine}</div>
            {timeLine ? (
              <div className="mt-0.5 truncate text-xs tabular-nums text-muted-foreground">
                {timeLine}
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-sm text-muted-foreground/60">No date yet</span>
        )}
      </TableCell>

      {/* Money: GMV → expense → revenue (the headline number) → commission */}
      <MoneyCell cents={gmvCents} currency={currency} estimate={isInquiry} />
      <ExpenseCell booking={booking} currency={currency} />
      <MoneyCell cents={booking.opsRevenueCents} currency={currency} strong signed />
      <MoneyCell
        cents={booking.opsCommissionCents}
        currency={currency}
        sub={commissionSplit}
        className="pr-6"
      />

      {/* Assigned admin */}
      <TableCell className="px-2 py-3 text-center align-top">
        {adminName ? (
          <span
            title={adminName}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-foreground"
          >
            {adminInitials(adminName) || "?"}
          </span>
        ) : unassigned ? (
          <span className="inline-block whitespace-nowrap rounded-full bg-destructive-soft px-2 py-0.5 text-[10px] font-semibold text-destructive">
            Unassigned
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Source */}
      <TableCell className="py-3 pl-4 align-top">
        {booking.source ? (
          <span
            className={cn(
              "inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              SOURCE_BADGE_CLASSES[booking.source] ?? SOURCE_BADGE_CLASSES.OTHER
            )}
          >
            {DEAL_SOURCE_LABELS[booking.source] ?? booking.source}
          </span>
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
