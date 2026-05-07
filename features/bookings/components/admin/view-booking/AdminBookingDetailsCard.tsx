"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import type {
  BookingSingleEditableField,
  BookingSingleFieldUpdate,
} from "@/features/bookings/booking-single-field-update";
import type { BoatForAdminSelect } from "@/features/boats/boat.types";
import { BoatSelect } from "@/features/boats/components/BoatSelect";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";

/** Serializable trip/customer slice for the admin detail card (built on the server). */
export type BookingTripDetailsSnapshot = {
  customerUserId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfPassengers: number;
  needsCaptain: boolean | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  startDateTime: string;
  endDateTime: string | null;
  boatTimezone: string | null;
  boatId: string | null;
  boatName: string | null;
  /** Preloads BoatSelect when the booking already has a boat */
  selectedBoat: BoatForAdminSelect | null;
};

const SECTION_HEADING = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function formatDateTime(iso: string | null | undefined, boatTimezone: string | null) {
  if (!iso) return "—";
  const parsed = parseDateTimeInBoatTimezone(iso, { timezone: boatTimezone ?? undefined });
  if (!parsed?.date) return "—";
  return format(parsed.date, "MMM d, yyyy h:mm a");
}

const TOAST_LABELS: Record<BookingSingleEditableField, string> = {
  customerName: "Customer name",
  customerEmail: "Customer email",
  customerPhone: "Customer phone",
  numberOfPassengers: "Passengers",
  needsCaptain: "Captain requested",
  pickupLocation: "Pickup location",
  dropoffLocation: "Drop-off location",
  startDateTime: "Trip start",
  endDateTime: "Trip end",
  boatId: "Boat",
};

function CompactEditableRow({
  field,
  label,
  display,
  editSlot,
  activeField,
  isPending,
  onEdit,
  onSave,
  onCancel,
}: {
  field: BookingSingleEditableField;
  label: string;
  display: ReactNode;
  editSlot: ReactNode;
  activeField: BookingSingleEditableField | null;
  isPending: boolean;
  onEdit: (field: BookingSingleEditableField) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const editing = activeField === field;
  const lockedOut = activeField !== null && !editing;

  return (
    <div className="space-y-1.5">
      <p className={`${SECTION_HEADING} font-medium`}>{label}</p>
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-sm leading-normal text-foreground">{display}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            disabled={lockedOut || isPending}
            aria-label={`Edit ${label}`}
            onClick={() => onEdit(field)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{editSlot}</div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" disabled={isPending} onClick={onSave}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminBookingDetailsCard({
  bookingId,
  trip,
}: {
  bookingId: string;
  trip: BookingTripDetailsSnapshot;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeField, setActiveField] = useState<BookingSingleEditableField | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [boatPick, setBoatPick] = useState<BoatForAdminSelect | null>(null);

  const tzHint = trip.boatTimezone ?? "default Eastern";

  const interactiveText = "text-foreground underline-offset-4 hover:text-primary hover:underline";

  function openField(field: BookingSingleEditableField) {
    setActiveField(field);
    switch (field) {
      case "customerName":
        setDraft(trip.customerName);
        break;
      case "customerEmail":
        setDraft(trip.customerEmail);
        break;
      case "customerPhone":
        setDraft(trip.customerPhone);
        break;
      case "numberOfPassengers":
        setDraft(trip.numberOfPassengers);
        break;
      case "needsCaptain":
        setDraft(trip.needsCaptain === true);
        break;
      case "pickupLocation":
        setDraft(trip.pickupLocation ?? "");
        break;
      case "dropoffLocation":
        setDraft(trip.dropoffLocation ?? "");
        break;
      case "startDateTime":
        setDraft(trip.startDateTime);
        break;
      case "endDateTime":
        setDraft(trip.endDateTime ?? "");
        break;
      case "boatId":
        setDraft(trip.boatId ?? "");
        setBoatPick(trip.selectedBoat);
        break;
    }
  }

  function cancelEdit() {
    setActiveField(null);
    setDraft(null);
    setBoatPick(null);
  }

  function saveField() {
    if (!activeField) return;

    startTransition(async () => {
      try {
        let payload: BookingSingleFieldUpdate;

        switch (activeField) {
          case "customerName":
            payload = { field: "customerName", value: String(draft ?? "").trim() };
            break;
          case "customerEmail":
            payload = { field: "customerEmail", value: String(draft ?? "").trim() };
            break;
          case "customerPhone":
            payload = { field: "customerPhone", value: String(draft ?? "").trim() };
            break;
          case "numberOfPassengers": {
            const raw =
              draft === "" || draft === null || draft === undefined
                ? NaN
                : typeof draft === "number"
                  ? draft
                  : Number(draft);
            payload = { field: "numberOfPassengers", value: raw };
            break;
          }
          case "needsCaptain":
            payload = { field: "needsCaptain", value: Boolean(draft) };
            break;
          case "pickupLocation": {
            const s = String(draft ?? "").trim();
            payload = { field: "pickupLocation", value: s === "" ? null : s };
            break;
          }
          case "dropoffLocation": {
            const s = String(draft ?? "").trim();
            payload = { field: "dropoffLocation", value: s === "" ? null : s };
            break;
          }
          case "startDateTime": {
            const iso = String(draft ?? "").trim();
            if (!iso || Number.isNaN(Date.parse(iso))) {
              toast({
                variant: "destructive",
                title: "Invalid start time",
                description: "Pick a valid date and time.",
              });
              return;
            }
            payload = { field: "startDateTime", value: iso };
            break;
          }
          case "endDateTime": {
            const raw = String(draft ?? "").trim();
            if (raw === "") {
              payload = { field: "endDateTime", value: null };
            } else if (Number.isNaN(Date.parse(raw))) {
              toast({
                variant: "destructive",
                title: "Invalid end time",
                description: "Pick a valid date and time, or clear the end time.",
              });
              return;
            } else {
              payload = { field: "endDateTime", value: raw };
            }
            break;
          }
          case "boatId": {
            const id = String(draft ?? "").trim();
            if (!id) {
              toast({
                variant: "destructive",
                title: "Select a boat",
                description: "Every booking must be tied to a boat.",
              });
              return;
            }
            payload = { field: "boatId", value: id };
            break;
          }
        }

        const result = await updateBookingSingleField(bookingId, payload);
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Could not save",
            description: result.error ?? "Unknown error",
          });
          return;
        }

        toast({ title: "Saved", description: `${TOAST_LABELS[activeField]} updated.` });
        cancelEdit();
        router.refresh();
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: e instanceof Error ? e.message : "Something went wrong",
        });
      }
    });
  }

  return (
    <Card className="h-full rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Customer &amp; trip</CardTitle>
        <p className="text-xs text-muted-foreground">
          Edit one field at a time. Times use the boat&apos;s timezone ({tzHint}). Changing the boat
          realigns pricing tier (when needed) and refreshes the quote totals.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="min-w-0 space-y-3">
            <CompactEditableRow
              field="customerName"
              label="Name"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={
                trip.customerUserId ? (
                  <Link
                    href={`/admin/users/${trip.customerUserId}`}
                    className={`font-medium ${interactiveText}`}
                  >
                    {trip.customerName?.trim() || "—"}
                  </Link>
                ) : (
                  <p className="font-medium text-foreground">{trip.customerName?.trim() || "—"}</p>
                )
              }
              editSlot={
                <Input
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="max-w-md"
                />
              }
            />
            <CompactEditableRow
              field="customerEmail"
              label="Email"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={
                trip.customerEmail ? (
                  <a href={`mailto:${trip.customerEmail}`} className={`block ${interactiveText}`}>
                    {trip.customerEmail}
                  </a>
                ) : (
                  "—"
                )
              }
              editSlot={
                <Input
                  type="email"
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="max-w-md"
                />
              }
            />
            <CompactEditableRow
              field="customerPhone"
              label="Phone"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={
                trip.customerPhone ? (
                  <a
                    href={`tel:${trip.customerPhone.replace(/\s/g, "")}`}
                    className={`block ${interactiveText}`}
                  >
                    {trip.customerPhone}
                  </a>
                ) : (
                  "—"
                )
              }
              editSlot={
                <Input
                  type="tel"
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="max-w-md"
                />
              }
            />
          </div>

          <div className="min-w-0 space-y-3">
            <CompactEditableRow
              field="boatId"
              label="Boat"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={
                trip.boatId && trip.boatName ? (
                  <Link
                    href={`/admin/boats/${trip.boatId}`}
                    className={`font-medium ${interactiveText}`}
                  >
                    {trip.boatName}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">—</span>
                )
              }
              editSlot={
                <div className="w-full max-w-md">
                  <BoatSelect
                    value={String(draft ?? "")}
                    selectedBoat={boatPick}
                    onChange={(boatId, boat) => {
                      setDraft(boatId);
                      setBoatPick(boat);
                    }}
                    showClearButton={false}
                  />
                </div>
              }
            />
          </div>
        </div>

        <div className="grid gap-5 border-t border-border/60 lg:grid-cols-2 lg:gap-6 py-4">
          <div className="min-w-0 space-y-4 text-sm">
            <CompactEditableRow
              field="startDateTime"
              label="From"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={formatDateTime(trip.startDateTime, trip.boatTimezone)}
              editSlot={
                <DateTimePicker
                  id="admin-trip-start"
                  className="w-full max-w-md"
                  value={String(draft ?? "")}
                  onChange={(v) => setDraft(v)}
                  placeholder="Select start date & time"
                  required
                />
              }
            />
            <CompactEditableRow
              field="endDateTime"
              label="To"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={formatDateTime(trip.endDateTime, trip.boatTimezone)}
              editSlot={
                <div className="flex w-full max-w-md flex-col gap-2">
                  <DateTimePicker
                    id="admin-trip-end"
                    className="w-full"
                    value={String(draft ?? "").trim() || undefined}
                    onChange={(v) => setDraft(v)}
                    placeholder="Select end date & time"
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto justify-start px-0 py-0 text-xs text-muted-foreground"
                    onClick={() => setDraft("")}
                  >
                    Clear end time
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Save after clearing to remove the trip end.
                  </p>
                </div>
              }
            />
          </div>

          <div className="min-w-0 space-y-4">
            <CompactEditableRow
              field="numberOfPassengers"
              label="Passengers"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={trip.numberOfPassengers}
              editSlot={
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={draft === "" || draft === null || draft === undefined ? "" : String(draft)}
                  onChange={(e) =>
                    setDraft(e.target.value === "" ? "" : Number.parseInt(e.target.value, 10))
                  }
                  autoFocus
                  className="w-24"
                />
              }
            />
            <CompactEditableRow
              field="needsCaptain"
              label="Captain requested"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={trip.needsCaptain === true ? "Yes" : "No"}
              editSlot={
                <div className="flex flex-wrap items-center gap-3">
                  <Switch
                    checked={draft === true}
                    onCheckedChange={(v) => setDraft(v)}
                    id="trip-needs-captain"
                  />
                  <label htmlFor="trip-needs-captain" className="text-sm">
                    Customer requested a captain
                  </label>
                </div>
              }
            />
            <CompactEditableRow
              field="pickupLocation"
              label="Pickup"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={trip.pickupLocation?.trim() || "—"}
              editSlot={
                <Input
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="max-w-lg"
                  placeholder="Pickup location"
                />
              }
            />
            <CompactEditableRow
              field="dropoffLocation"
              label="Drop-off"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={trip.dropoffLocation?.trim() || "—"}
              editSlot={
                <Input
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="max-w-lg"
                  placeholder="Drop-off location"
                />
              }
            />
            <div className="space-y-1 pt-1">
              <h3 className={SECTION_HEADING}>Booking ID</h3>
              <p className="break-all font-mono text-xs text-foreground">{bookingId}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
