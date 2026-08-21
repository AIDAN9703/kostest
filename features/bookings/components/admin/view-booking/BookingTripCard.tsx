"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import { useBookingEditMode } from "@/features/bookings/components/admin/view-booking/BookingEditMode";
import {
  OpsCaptainAssignment,
  type CaptainAssignmentOption,
} from "@/features/bookings/components/admin/OpsCaptainAssignment";
import {
  OpsCrewAssignment,
  type CrewAssignmentMember,
  type CrewAssignmentOption,
} from "@/features/bookings/components/admin/OpsCrewAssignment";
import { useToast } from "@/shared/lib/hooks/use-toast";
import {
  bookingInstantToDatetimeLocalInput,
  datetimeLocalInputToUtcISO,
  formatBoatLocal,
} from "@/shared/lib/utils/date-helpers";

export interface BookingTripDetailsSnapshot {
  /** Trip fields are null while the deal is an INQUIRY without a set trip. */
  numberOfPassengers: number | null;
  needsCaptain: boolean | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  /** ISO string */
  startDateTime: string | null;
  endDateTime: string | null;
  boatTimezone: string | null;
  boatId: string | null;
  boatName: string | null;
  selectedBoat: {
    id: string;
    name: string;
    mainImage: string | null;
    capacity: number;
    locationLabel: string | null;
    cleaningFee: number | null;
    depositAmount: number | null;
    crewRequired: boolean | null;
  } | null;
}

interface BookingTripCardProps {
  bookingId: string;
  trip: BookingTripDetailsSnapshot;
  captainUserId: string | null;
  captainFirstName: string | null;
  captainLastName: string | null;
  captainEmail: string | null;
  captainOptions: CaptainAssignmentOption[];
  bookingCrew: CrewAssignmentMember[];
  crewOptions: CrewAssignmentOption[];
}

function formatTripDateTime(iso: string | null, timezone: string | null): string {
  if (!iso) return "—";
  // Date AND time in the boat's zone — formatting only the time left the date
  // one day off for trips near midnight.
  return formatBoatLocal(iso, timezone, "MMM d, yyyy · h:mm a zzz") || "—";
}

/**
 * The trip itself. Read-only facts until the page-level Edit mode is on —
 * then dates, passengers, captain flag, and locations become a single form
 * with one Save. Captain/crew assignment stays live in both modes (it's an
 * assignment control, not a field). Boat changes go through their own flow.
 */
export function BookingTripCard({
  bookingId,
  trip,
  captainUserId,
  captainFirstName,
  captainLastName,
  captainEmail,
  captainOptions,
  bookingCrew,
  crewOptions,
}: BookingTripCardProps) {
  const { editing, registerSaver } = useBookingEditMode();
  const router = useRouter();
  const { toast } = useToast();

  // Edited in the BOAT's local time — an admin in another timezone must not
  // silently shift the trip by their own offset.
  const tz = trip.boatTimezone;
  const toInput = (iso: string | null) => bookingInstantToDatetimeLocalInput(iso, tz);
  const [start, setStart] = useState(() => toInput(trip.startDateTime));
  const [end, setEnd] = useState(() => toInput(trip.endDateTime));
  const [passengers, setPassengers] = useState(trip.numberOfPassengers);
  const [needsCaptain, setNeedsCaptain] = useState(Boolean(trip.needsCaptain));
  const [pickup, setPickup] = useState(trip.pickupLocation ?? "");
  const [dropoff, setDropoff] = useState(trip.dropoffLocation ?? "");

  // "Done updating" calls the latest save via ref — state closures go stale
  // in a registry, refs don't.
  const saveRef = useRef<() => Promise<boolean>>(async () => true);
  useEffect(() => {
    if (!editing) return;
    return registerSaver("trip-details", () => saveRef.current());
  }, [editing, registerSaver]);

  // Runs when the admin clicks "Done updating" (registered below). Returns
  // false on failure so edit mode stays open and nothing is silently lost.
  async function handleSave(): Promise<boolean> {
      const updates: Array<{ field: string; value: unknown }> = [];
      // Dates save as ONE atomic window — sending start and end separately
      // let the DB see end-before-start mid-save and reject the edit.
      const startChanged = start !== toInput(trip.startDateTime);
      const endChanged = end !== toInput(trip.endDateTime);
      if (startChanged || endChanged) {
        const isoStart = datetimeLocalInputToUtcISO(start, tz);
        if (!isoStart) {
          toast({ title: "Invalid start date", variant: "destructive" });
          return false;
        }
        updates.push({
          field: "tripWindow",
          value: { startDateTime: isoStart, endDateTime: datetimeLocalInputToUtcISO(end, tz) },
        });
      }
      if (passengers !== trip.numberOfPassengers) {
        updates.push({ field: "numberOfPassengers", value: passengers });
      }
      if (needsCaptain !== Boolean(trip.needsCaptain)) {
        updates.push({ field: "needsCaptain", value: needsCaptain });
      }
      if (pickup !== (trip.pickupLocation ?? "")) {
        updates.push({ field: "pickupLocation", value: pickup.trim() || null });
      }
      if (dropoff !== (trip.dropoffLocation ?? "")) {
        updates.push({ field: "dropoffLocation", value: dropoff.trim() || null });
      }

      if (updates.length === 0) return true;
      for (const update of updates) {
        const res = await updateBookingSingleField(bookingId, update);
        if (!res.success) {
          toast({
            title: "Couldn't save trip details",
            description: res.error,
            variant: "destructive",
          });
          return false;
        }
      }
      toast({ title: "Trip details saved" });
      router.refresh();
      return true;
  }
  useEffect(() => {
    saveRef.current = handleSave;
  });

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trip details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Boat + people — live controls in both modes. Captain and Crew get
            their own labeled cells with matching person-chip affordances. */}
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <Fact label="Boat">
            {trip.boatId ? (
              <Link
                href={`/boats/${trip.boatId}`}
                className="text-sm font-medium text-primary-strong hover:underline"
              >
                {trip.boatName ?? "View boat"}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </Fact>
          <Fact label="Captain">
            <OpsCaptainAssignment
              bookingId={bookingId}
              captainUserId={captainUserId}
              captainFirstName={captainFirstName}
              captainLastName={captainLastName}
              captainEmail={captainEmail}
              captainOptions={captainOptions}
            />
          </Fact>
          <Fact label="Crew">
            <OpsCrewAssignment
              bookingId={bookingId}
              assignedCrew={bookingCrew}
              crewOptions={crewOptions}
            />
          </Fact>
        </div>

        {editing ? (
          <div className="space-y-4 border-t border-border/50 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">From (boat local)</Label>
                <Input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To (boat local)</Label>
                <Input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Passengers</Label>
                <Input
                  type="number"
                  min={1}
                  value={passengers ?? ""}
                  onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={needsCaptain} onCheckedChange={setNeedsCaptain} />
                <Label className="text-sm">Captain requested</Label>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pickup</Label>
                <Input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Marina / dock"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Drop-off</Label>
                <Input
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        ) : (
          <dl className="grid gap-x-6 gap-y-4 border-t border-border/50 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="From">
              <span className="text-sm font-medium tabular-nums">
                {formatTripDateTime(trip.startDateTime, trip.boatTimezone)}
              </span>
            </Fact>
            <Fact label="To">
              <span className="text-sm font-medium tabular-nums">
                {formatTripDateTime(trip.endDateTime, trip.boatTimezone)}
              </span>
            </Fact>
            <Fact label="Passengers">
              <span className="text-sm font-medium tabular-nums">{trip.numberOfPassengers}</span>
            </Fact>
            <Fact label="Captain requested">
              <span className="text-sm font-medium">{trip.needsCaptain ? "Yes" : "No"}</span>
            </Fact>
            <Fact label="Pickup">
              <span className="text-sm font-medium">
                {trip.pickupLocation || <span className="text-muted-foreground/50">—</span>}
              </span>
            </Fact>
            <Fact label="Drop-off">
              <span className="text-sm font-medium">
                {trip.dropoffLocation || <span className="text-muted-foreground/50">—</span>}
              </span>
            </Fact>
            <Fact label="Booking ID">
              <span className="break-all font-mono text-xs text-muted-foreground">
                {bookingId}
              </span>
            </Fact>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
