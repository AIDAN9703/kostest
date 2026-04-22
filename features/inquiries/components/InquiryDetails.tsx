import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Inquiry } from "@/database/types";
import { formatDate, formatTime12Hour } from "@/shared/lib/utils/general-utils";

interface InquiryDetailsProps {
  inquiry: Inquiry;
}

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
  const hasDetails =
    inquiry.date || inquiry.time || inquiry.budget || inquiry.guests;

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
          {inquiry.date && (
            <InfoRow label="Requested Date" value={formatDate(inquiry.date)} />
          )}
          {inquiry.time && (
            <InfoRow
              label="Time / Duration"
              value={
                inquiry.date && /^\d{1,2}:\d{2}$/.test(inquiry.time.trim())
                  ? formatTime12Hour(inquiry.time)
                  : inquiry.time
              }
            />
          )}
          {inquiry.guests != null && (
            <InfoRow label="Guests" value={`${inquiry.guests}`} />
          )}
          {inquiry.budget && <InfoRow label="Budget" value={inquiry.budget} />}
        </div>
      </CardContent>
    </Card>
  );
}
