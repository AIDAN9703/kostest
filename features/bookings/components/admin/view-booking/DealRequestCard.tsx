import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TIME_OF_DAY_LABELS } from "@/features/bookings/deal-status";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { formatDate, formatPlainDate } from "@/shared/lib/utils/general-utils";
import type { BookingDetails } from "@/features/bookings/booking.types";

/**
 * What the customer asked for — the INQUIRY-phase face of the trip card.
 * Once the deal is priced into a proposal, BookingTripCard takes over.
 */
export function DealRequestCard({ deal }: { deal: BookingDetails }) {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Request</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Fact
            label="Boat requested"
            value={
              deal.boatId ? (
                <Link
                  href={`/admin/boats/${deal.boatId}`}
                  className="text-primary-strong hover:underline"
                >
                  {deal.boatName ?? "View boat"}
                </Link>
              ) : null
            }
          />
          <Fact
            label="Date"
            value={
              deal.startDateTime
                ? formatDate(deal.startDateTime)
                : deal.preferredDate
                  ? formatPlainDate(deal.preferredDate)
                  : null
            }
          />
          <Fact
            label="Time of day"
            value={
              deal.preferredTimeOfDay
                ? (TIME_OF_DAY_LABELS[deal.preferredTimeOfDay] ?? deal.preferredTimeOfDay)
                : null
            }
          />
          <Fact
            label="Duration"
            value={deal.requestedDurationDays ? `${deal.requestedDurationDays}+ days` : null}
          />
          <Fact label="Destination" value={deal.destination} />
          <Fact
            label="Guests"
            value={deal.numberOfPassengers != null ? `${deal.numberOfPassengers}` : null}
          />
          <Fact
            label="Budget"
            value={deal.budgetCents != null ? formatCentsAsCurrency(deal.budgetCents) : null}
          />
          <Fact
            label="Estimated value"
            value={
              deal.estimatedValueCents != null
                ? formatCentsAsCurrency(deal.estimatedValueCents)
                : null
            }
          />
          <Fact
            label="Captain"
            value={deal.needsCaptain == null ? null : deal.needsCaptain ? "Needed" : "Not needed"}
          />
          <Fact label="SMS consent" value={deal.smsConsent ? "Yes" : "No"} />
        </dl>
        {deal.customerMessage ? (
          <div className="mt-5 border-t border-border/50 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Message
            </p>
            <p className="mt-1.5 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
              {deal.customerMessage}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}
