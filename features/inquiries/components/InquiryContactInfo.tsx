import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { GeneralInquiry } from "@/database/types";

interface InquiryContactInfoProps {
  inquiry: GeneralInquiry;
}

const InfoRow = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
    {children ?? (
      <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
    )}
  </div>
);

export function InquiryContactInfo({ inquiry }: InquiryContactInfoProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-4 w-4" />
          Contact Information
        </CardTitle>
        <CardDescription>Lead contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InfoRow label="Email">
            <a
              href={`mailto:${inquiry.email}`}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {inquiry.email}
            </a>
          </InfoRow>
          <InfoRow label="Phone">
            <a
              href={`tel:${inquiry.phone}`}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {inquiry.phone}
            </a>
          </InfoRow>
        </div>
        {inquiry.message && (
          <div className="space-y-1 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Message
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {inquiry.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
