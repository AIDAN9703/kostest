import { MessageSquare } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { getStatusBadgeClass } from "@/shared/lib/utils/badge-utils";
import { formatDate } from "@/shared/lib/utils/general-utils";
import type { GeneralInquiry } from "@/database/types";

interface InquiryProfileHeaderProps {
  inquiry: GeneralInquiry;
}

function formatStage(stage: string) {
  return stage
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function InquiryProfileHeader({ inquiry }: InquiryProfileHeaderProps) {
  const stageBadgeClass = getStatusBadgeClass(inquiry.stage);
  const outcomeBadgeClass = getStatusBadgeClass(inquiry.outcome);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center shrink-0">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-1 flex flex-col min-w-0">
          <h2 className="text-2xl font-bold text-foreground">{inquiry.name}</h2>
          <span className="text-xs font-mono text-muted-foreground">
            ID: {inquiry.id}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Received {formatDate(inquiry.createdAt)}
            </span>
          </div>
          {/* Status Badges */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Stage:
              </span>
              <Badge
                className={stageBadgeClass}
                title="Stage: Needs Contact, Contacted, Converted"
              >
                {formatStage(inquiry.stage)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Outcome:
              </span>
              <Badge
                className={outcomeBadgeClass}
                title="Outcome: Open, Won, Lost, Abandoned"
              >
                {formatStage(inquiry.outcome)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
