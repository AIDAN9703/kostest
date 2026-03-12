import {
  MessageSquare,
  ArrowRightLeft,
  FileText,
  Phone,
  Circle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/utils/general-utils";
import type { InquiryEvent } from "@/database/types";

interface InquiryTimelineProps {
  events: (InquiryEvent & {
    createdByUser?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
  })[];
  actions?: React.ReactNode;
}

const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  CREATED: {
    icon: MessageSquare,
    label: "Inquiry created",
    color: "text-primary",
  },
  STAGE_CHANGE: {
    icon: ArrowRightLeft,
    label: "Stage changed",
    color: "text-purple-600",
  },
  OUTCOME_CHANGE: {
    icon: ArrowRightLeft,
    label: "Outcome changed",
    color: "text-purple-600",
  },
  NOTE: {
    icon: FileText,
    label: "Note added",
    color: "text-amber-600",
  },
  CONTACT_ATTEMPT: {
    icon: Phone,
    label: "Contact",
    color: "text-emerald-600",
  },
};

const CONTACT_METHOD_LABELS: Record<string, string> = {
  EMAIL: "Email",
  PHONE: "Phone",
  SMS: "SMS",
  IN_PERSON: "In person",
  OTHER: "Other",
};

function formatStatus(s: string) {
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function InquiryTimeline({ events, actions }: InquiryTimelineProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Circle className="h-4 w-4" />
              Activity Timeline
            </CardTitle>
            <CardDescription>
              {events.length === 0
                ? "No activity yet"
                : `${events.length} event${events.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Activity will appear here when status changes, notes, or contacts
              are logged.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-6">
              {events.map((event) => {
                const config = EVENT_CONFIG[event.eventType] || {
                  ...EVENT_CONFIG.NOTE,
                  label: event.eventType
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
                };
                const Icon = config.icon;
                const createdBy =
                  event.createdByUser?.firstName ||
                  event.createdByUser?.lastName
                    ? `${event.createdByUser.firstName || ""} ${event.createdByUser.lastName || ""}`.trim()
                    : event.createdByUser?.email || "System";

                return (
                  <div key={event.id} className="relative flex gap-4 pl-2">
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ${config.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          {config.label}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(event.createdAt)}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {createdBy}
                        </span>
                      </div>

                      {event.eventType === "STAGE_CHANGE" &&
                        event.previousStage &&
                        event.newStage && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatStatus(event.previousStage)} →{" "}
                            {formatStatus(event.newStage)}
                          </p>
                        )}

                      {event.eventType === "OUTCOME_CHANGE" &&
                        event.previousOutcome &&
                        event.newOutcome && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatStatus(event.previousOutcome)} →{" "}
                            {formatStatus(event.newOutcome)}
                          </p>
                        )}

                      {event.eventType === "CONTACT_ATTEMPT" &&
                        event.contactMethod && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Via{" "}
                            {CONTACT_METHOD_LABELS[event.contactMethod] ||
                              event.contactMethod}
                          </p>
                        )}

                      {event.content && (
                        <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {event.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
