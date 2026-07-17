"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { useToast } from "@/shared/lib/hooks/use-toast";
import {
  getBoatTimezone,
  parseDateTimeInBoatTimezone,
} from "@/shared/lib/utils/date-helpers";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import type {
  BookingSingleEditableField,
  BookingSingleFieldUpdate,
} from "@/features/bookings/booking-single-field-update";
import type { BoatForAdminSelect } from "@/features/boats/boat.types";
import { BoatSelect } from "@/features/boats/components/BoatSelect";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import {
  BOOKING_FIELD_LABEL,
  BookingDetailEditableRow,
} from "@/features/bookings/components/admin/view-booking/BookingDetailEditableRow";
import { OpsCaptainAssignment } from "@/features/bookings/components/admin/OpsCaptainAssignment";
import type { CaptainAssignmentOption } from "@/features/bookings/components/admin/OpsCaptainAssignment";
import { OpsCrewAssignment } from "@/features/bookings/components/admin/OpsCrewAssignment";
import type {
  CrewAssignmentMember,
  CrewAssignmentOption,
} from "@/features/bookings/components/admin/OpsCrewAssignment";

/** Serializable trip slice for the admin detail card (built on the server). */
export type BookingTripDetailsSnapshot = {
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

function formatDateTime(iso: string | null | undefined, boatTimezone: string | null) {
  if (!iso) return "—";
  const parsed = parseDateTimeInBoatTimezone(iso, { timezone: boatTimezone ?? undefined });
  if (!parsed?.date) return "—";
  return format(parsed.date, "MMM d, yyyy h:mm a");
}

function formatDateTimeWithTimezone(
  iso: string | null | undefined,
  boatTimezone: string | null
): ReactNode {
  const formatted = formatDateTime(iso, boatTimezone);
  if (formatted === "—") return "—";
  const tz = getBoatTimezone({ timezone: boatTimezone ?? undefined });
  return (
    <>
      {formatted}
      <span className="text-muted-foreground"> · {tz}</span>
    </>
  );
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

export function AdminBookingDetailsCard({
  bookingId,
  trip,
  captainUserId,
  captainFirstName,
  captainLastName,
  captainEmail,
  captainOptions,
  bookingCrew,
  crewOptions,
}: {
  bookingId: string;
  trip: BookingTripDetailsSnapshot;
  captainUserId: string | null;
  captainFirstName: string | null;
  captainLastName: string | null;
  captainEmail: string | null;
  captainOptions: CaptainAssignmentOption[];
  bookingCrew: CrewAssignmentMember[];
  crewOptions: CrewAssignmentOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeField, setActiveField] = useState<BookingSingleEditableField | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [boatPick, setBoatPick] = useState<BoatForAdminSelect | null>(null);

  const interactiveText = "text-foreground underline-offset-4 hover:text-primary-strong hover:underline";

  function openField(field: BookingSingleEditableField) {
    setActiveField(field);
    switch (field) {
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
          default:
            return;
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
        <CardTitle className="text-lg">Trip details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <BookingDetailEditableRow
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

        <div className="flex flex-wrap items-start gap-x-10 gap-y-5 border-t border-border/60 pt-4">
          <OpsCaptainAssignment
            bookingId={bookingId}
            captainUserId={captainUserId}
            captainFirstName={captainFirstName}
            captainLastName={captainLastName}
            captainEmail={captainEmail}
            captainOptions={captainOptions}
          />
          <OpsCrewAssignment
            bookingId={bookingId}
            assignedCrew={bookingCrew}
            crewOptions={crewOptions}
          />
        </div>

        <div className="grid gap-5 border-t border-border/60 lg:grid-cols-2 lg:gap-6 pt-4">
          <div className="min-w-0 space-y-4 text-sm">
            <BookingDetailEditableRow
              field="startDateTime"
              label="From"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={formatDateTimeWithTimezone(trip.startDateTime, trip.boatTimezone)}
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
            <BookingDetailEditableRow
              field="endDateTime"
              label="To"
              activeField={activeField}
              isPending={isPending}
              onEdit={openField}
              onSave={saveField}
              onCancel={cancelEdit}
              display={formatDateTimeWithTimezone(trip.endDateTime, trip.boatTimezone)}
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
                </div>
              }
            />
          </div>

          <div className="min-w-0 space-y-4">
            <BookingDetailEditableRow
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
            <BookingDetailEditableRow
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
            <BookingDetailEditableRow
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
            <BookingDetailEditableRow
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
              <h3 className={BOOKING_FIELD_LABEL}>Booking ID</h3>
              <p className="break-all font-mono text-xs text-foreground">{bookingId}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
