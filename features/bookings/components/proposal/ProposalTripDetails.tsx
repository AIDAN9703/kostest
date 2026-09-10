"use client";

import { CalendarDays, Clock, MapPin, MapPinned, Users } from "lucide-react";
import { formatBoatLocal } from "@/shared/lib/utils/date-helpers";
import type { ProposalData } from "@/features/bookings/lib/proposal.types";

interface ProposalTripDetailsProps {
  data: ProposalData;
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ProposalTripDetails({ data }: ProposalTripDetailsProps) {
  // Boat-local, always: the charter leaves a physical dock, so every viewer
  // sees the same departure hour no matter where they're reading from.
  const tz = data.timezone;
  const dateLabel = formatBoatLocal(data.startDateTime, tz, "EEE, MMM d, yyyy");
  const startLabel = formatBoatLocal(data.startDateTime, tz, "h:mm a zzz");
  const endLabel = data.endDateTime
    ? formatBoatLocal(data.endDateTime, tz, "h:mm a zzz")
    : "—";

  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <Detail icon={CalendarDays} label="Date" value={dateLabel} />
      <Detail
        icon={Users}
        label="Guests"
        value={`${data.numberOfPassengers} ${data.numberOfPassengers === 1 ? "guest" : "guests"}`}
      />
      <Detail icon={Clock} label="Start" value={startLabel} />
      <Detail icon={Clock} label="End" value={endLabel} />
      <Detail icon={MapPin} label="Pickup" value={data.pickupLocation || "To be confirmed"} />
      <Detail icon={MapPinned} label="Dropoff" value={data.dropoffLocation || "—"} />
    </div>
  );
}
