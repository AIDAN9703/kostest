import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Inquiry } from "@/database/types";
import {
  formatDate,
  formatPlainDate,
  formatTime12Hour,
} from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

interface InquiryDetailsProps {
  inquiry: Inquiry;
}

const TIME_OF_DAY_LABELS: Record<string, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  FLEXIBLE: "Flexible",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
  </div>
);

export function InquiryDetails({ inquiry }: InquiryDetailsProps) {
  // Date: exact requested window (boat leads) → fuzzy preferred date → legacy.
  let dateValue: string | null = null;
  let timeValue: string | null = null;

  if (inquiry.requestedStartDateTime) {
    dateValue = formatDate(inquiry.requestedStartDateTime);
    timeValue = format(new Date(inquiry.requestedStartDateTime), "h:mm a");
  } else if (inquiry.preferredDate) {
    dateValue = formatPlainDate(inquiry.preferredDate);
    timeValue = inquiry.preferredTimeOfDay
      ? (TIME_OF_DAY_LABELS[inquiry.preferredTimeOfDay] ?? null)
      : null;
  } else if (inquiry.date) {
    // Legacy rows (pre-unification).
    dateValue = formatDate(inquiry.date);
    timeValue = inquiry.time
      ? /^\d{1,2}:\d{2}$/.test(inquiry.time.trim())
        ? formatTime12Hour(inquiry.time)
        : inquiry.time
      : null;
  }

  const budgetValue = inquiry.budget ?? null;
  const hasDetails =
    dateValue ||
    timeValue ||
    budgetValue ||
    inquiry.guests != null ||
    inquiry.destination ||
    inquiry.requestedDurationDays != null ||
    inquiry.estimatedTotalCents != null;

  if (!hasDetails) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-4 w-4" />
          Charter Details
        </CardTitle>
        <CardDescription>Requested preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {dateValue && <InfoRow label="Requested Date" value={dateValue} />}
          {timeValue && <InfoRow label="Preferred Time" value={timeValue} />}
          {inquiry.requestedDurationDays != null && (
            <InfoRow
              label="Duration"
              value={`${inquiry.requestedDurationDays}+ days`}
            />
          )}
          {inquiry.destination && (
            <InfoRow label="Destination" value={inquiry.destination} />
          )}
          {inquiry.guests != null && (
            <InfoRow label="Guests" value={`${inquiry.guests}`} />
          )}
          {budgetValue && <InfoRow label="Budget" value={budgetValue} />}
          {inquiry.estimatedTotalCents != null && (
            <InfoRow
              label="Estimated Total"
              value={formatCentsAsCurrency(inquiry.estimatedTotalCents)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
