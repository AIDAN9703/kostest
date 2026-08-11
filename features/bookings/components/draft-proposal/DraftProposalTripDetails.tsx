"use client";

import { CalendarDays, Clock, MapPin, MapPinned, Users } from "lucide-react";
import type { DraftProposalData } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalTripDetailsProps {
  data: DraftProposalData;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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

export function DraftProposalTripDetails({ data }: DraftProposalTripDetailsProps) {
  const start = new Date(data.startDateTime);
  const end = data.endDateTime ? new Date(data.endDateTime) : null;

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <Detail icon={CalendarDays} label="Date" value={dateLabel} />
      <Detail
        icon={Users}
        label="Guests"
        value={`${data.numberOfPassengers} ${data.numberOfPassengers === 1 ? "guest" : "guests"}`}
      />
      <Detail icon={Clock} label="Start" value={formatTime(start)} />
      <Detail icon={Clock} label="End" value={end ? formatTime(end) : "—"} />
      <Detail icon={MapPin} label="Pickup" value={data.pickupLocation || "To be confirmed"} />
      <Detail icon={MapPinned} label="Dropoff" value={data.dropoffLocation || "—"} />
    </div>
  );
}
