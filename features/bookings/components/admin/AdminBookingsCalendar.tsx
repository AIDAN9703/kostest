"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { format } from "date-fns";
import {
  Anchor,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Mail,
  Phone,
  RotateCcw,
  Ship,
  Users,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { bookingSearchParams } from "@/features/bookings/searchParams";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { cn } from "@/shared/lib/utils/general-utils";

type CalendarView = "dayGridMonth" | "listWeek";

interface ExtendedProps {
  bookingId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  boatName: string | null;
  captainFirstName: string | null;
  captainLastName: string | null;
  bookingStatus: string;
  paymentDisplayStatus: string;
  totalAmountCents: number;
  opsGmvCents: number | null;
  opsExpenseCents: number | null;
  needsCaptain: boolean | null;
  numberOfPassengers: number;
}

interface SelectedEvent {
  start: string;
  end: string | null;
  backgroundColor: string;
  extendedProps: ExtendedProps;
}

/**
 * /admin/bookings calendar view — shares URL filter state with the table.
 *
 * FullCalendar appends `start` and `end` to the events URL automatically (for
 * the currently visible range); our server route uses those as the date window
 * and applies the rest of the filters from URL search params.
 */
export function AdminBookingsCalendar() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [filters] = useQueryStates(bookingSearchParams, {
    clearOnDefault: true,
    shallow: false,
  });
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const [selected, setSelected] = useState<SelectedEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /**
   * Build the events URL. FullCalendar will append `&start=...&end=...` based on
   * the visible range. Only filters that affect data are forwarded.
   */
  const eventsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.bookingStatus) params.set("bookingStatus", filters.bookingStatus);
    if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
    if (filters.bookingType) params.set("bookingType", filters.bookingType);
    if (filters.assignedAdminId) params.set("assignedAdminId", filters.assignedAdminId);
    if (filters.bookingGroupId) params.set("bookingGroupId", filters.bookingGroupId);
    if (filters.needsCaptain != null)
      params.set("needsCaptain", String(filters.needsCaptain));
    if (filters.minAmount != null) params.set("minAmount", String(filters.minAmount));
    if (filters.maxAmount != null) params.set("maxAmount", String(filters.maxAmount));
    const query = params.toString();
    return query
      ? `/api/admin/bookings/calendar-events?${query}`
      : "/api/admin/bookings/calendar-events";
  }, [filters]);

  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    if (!info.event.start) return;
    setSelected({
      start: info.event.start.toISOString(),
      end: info.event.end ? info.event.end.toISOString() : null,
      backgroundColor: info.event.backgroundColor,
      extendedProps: info.event.extendedProps as ExtendedProps,
    });
    setModalOpen(true);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Booking schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 items-center rounded-md border border-border bg-card p-0.5">
            <ViewBtn active={currentView === "dayGridMonth"} onClick={() => handleViewChange("dayGridMonth")}>
              Month
            </ViewBtn>
            <ViewBtn active={currentView === "listWeek"} onClick={() => handleViewChange("listWeek")}>
              List
            </ViewBtn>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => calendarRef.current?.getApi().prev()}
            aria-label="Previous"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => calendarRef.current?.getApi().today()}
            aria-label="Today"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => calendarRef.current?.getApi().next()}
            aria-label="Next"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 [&_.fc]:text-sm [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-button]:!bg-transparent [&_.fc-button]:!border-border [&_.fc-button]:!text-foreground [&_.fc-button]:!shadow-none [&_.fc-button-primary:not(:disabled).fc-button-active]:!bg-muted [&_.fc-button-primary:not(:disabled).fc-button-active]:!text-foreground [&_.fc-event]:cursor-pointer [&_.fc-list-event:hover_td]:!bg-muted/40">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: "title",
            center: "",
            right: "",
          }}
          height="auto"
          editable={false}
          selectable={false}
          dayMaxEvents
          weekends
          events={eventsUrl}
          eventClick={handleEventClick}
          eventDisplay="block"
          dayHeaderFormat={{ weekday: "short", month: "numeric", day: "numeric" }}
          slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          nowIndicator
        />
      </div>

      <BookingEventDialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelected(null);
        }}
        event={selected}
        onView={(bookingId) => {
          setModalOpen(false);
          setSelected(null);
          router.push(`/admin/bookings/${bookingId}`);
        }}
      />
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-[6px] px-2.5 text-xs font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function BookingEventDialog({
  open,
  onOpenChange,
  event,
  onView,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SelectedEvent | null;
  onView: (id: string) => void;
}) {
  if (!event) return null;
  const p = event.extendedProps;
  const captain =
    p.captainFirstName || p.captainLastName
      ? `${p.captainFirstName ?? ""} ${p.captainLastName ?? ""}`.trim()
      : null;
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;
  const gmvCents = p.opsGmvCents && p.opsGmvCents > 0 ? p.opsGmvCents : p.totalAmountCents;
  const revenueCents = p.opsExpenseCents != null ? gmvCents - p.opsExpenseCents : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: event.backgroundColor }}
              aria-hidden
            />
            {p.customerName ?? "Unknown customer"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
              {p.bookingStatus}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
              <CreditCard className="h-3 w-3" />
              {p.paymentDisplayStatus}
            </span>
          </div>

          <Row icon={CalendarDays} label="Date">
            {format(startDate, "EEE, MMM d, yyyy")}
            <span className="text-muted-foreground">
              {" · "}
              {format(startDate, "h:mm a")}
              {endDate ? ` – ${format(endDate, "h:mm a")}` : ""}
            </span>
          </Row>

          <Row icon={Ship} label="Boat">
            {p.boatName ?? "—"}
          </Row>

          <Row icon={Anchor} label="Captain">
            {captain ?? (p.needsCaptain ? <em className="text-amber-700 dark:text-amber-400">Captain needed</em> : "Self-drive")}
          </Row>

          <Row icon={Users} label="Guests">
            {p.numberOfPassengers}
          </Row>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Tile
              label="GMV"
              value={formatCentsAsCurrency(gmvCents)}
              tone="neutral"
            />
            <Tile
              label="Revenue"
              value={revenueCents != null ? formatCentsAsCurrency(revenueCents) : "—"}
              tone={revenueCents == null ? "muted" : revenueCents < 0 ? "negative" : "positive"}
            />
          </div>

          {(p.customerEmail || p.customerPhone) && (
            <div className="space-y-1 border-t border-border pt-2">
              {p.customerEmail && (
                <a
                  href={`mailto:${p.customerEmail}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-3 w-3" />
                  {p.customerEmail}
                </a>
              )}
              {p.customerPhone && (
                <a
                  href={`tel:${p.customerPhone}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-3 w-3" />
                  {p.customerPhone}
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/bookings/${p.bookingId}`}>Open details</Link>
            </Button>
            <Button size="sm" onClick={() => onView(p.bookingId)}>
              Go to booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "positive" && "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/30",
        tone === "negative" && "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/30",
        tone === "muted" && "border-border bg-muted/30",
        tone === "neutral" && "border-border bg-card",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "negative" && "text-rose-700 dark:text-rose-400",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
