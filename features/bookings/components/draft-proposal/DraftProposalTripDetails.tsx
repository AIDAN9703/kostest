"use client";

import { Clock, MapPin, MapPinned } from "lucide-react";
import type { DraftProposalData } from "@/features/bookings/lib/draft-proposal.types";

interface DraftProposalTripDetailsProps {
  data: DraftProposalData;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function DraftProposalTripDetails({ data }: DraftProposalTripDetailsProps) {
  const start = new Date(data.startDateTime);
  const end = data.endDateTime ? new Date(data.endDateTime) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Start</p>
          <p className="mt-0.5 font-medium text-foreground">{formatTime(start)}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">End</p>
          <p className="mt-0.5 font-medium text-foreground">{end ? formatTime(end) : "—"}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pickup</p>
          <p className="mt-0.5 font-medium text-foreground">
            {data.pickupLocation || "To be confirmed"}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dropoff</p>
          <p className="mt-0.5 font-medium text-foreground">{data.dropoffLocation || "—"}</p>
        </div>
      </div>
    </div>
  );
}
