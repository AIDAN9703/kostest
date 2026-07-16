import {
  MessageSquare,
  ArrowRightLeft,
  FileText,
  Phone,
  UserPlus,
} from "lucide-react";
import { formatDateTime } from "@/shared/lib/utils/general-utils";
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

const EVENT_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  CREATED: { icon: MessageSquare, label: "Inquiry received", color: "text-primary" },
  STAGE_CHANGE: { icon: ArrowRightLeft, label: "Stage changed", color: "text-violet-600 dark:text-violet-400" },
  OUTCOME_CHANGE: { icon: ArrowRightLeft, label: "Outcome changed", color: "text-violet-600 dark:text-violet-400" },
  NOTE: { icon: FileText, label: "Note", color: "text-amber-600 dark:text-amber-400" },
  CONTACT_ATTEMPT: { icon: Phone, label: "Contact", color: "text-emerald-600 dark:text-emerald-400" },
  ASSIGNED: { icon: UserPlus, label: "Assigned", color: "text-sky-600 dark:text-sky-400" },
};

const CONTACT_METHOD_LABELS: Record<string, string> = {
  EMAIL: "email",
  PHONE: "phone",
  SMS: "SMS",
  IN_PERSON: "in person",
  OTHER: "other",
};

function formatStatus(s: string) {
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function InquiryTimeline({ events, actions }: InquiryTimelineProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-foreground/50" aria-hidden />
          Ship&apos;s log
          {events.length > 0 ? (
            <span className="tabular-nums text-muted-foreground/60">{events.length}</span>
          ) : null}
        </h2>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {events.length === 0 ? (
        <p className="py-8 text-sm text-muted-foreground">
          Notes, contact attempts, and status changes will appear here.
        </p>
      ) : (
        <div className="relative pt-4">
          <div className="absolute bottom-3 left-[13px] top-6 w-px bg-border/60" />
          <div className="flex flex-col gap-5">
            {events.map((event) => {
              const config = EVENT_CONFIG[event.eventType] || {
                ...EVENT_CONFIG.NOTE,
                label: formatStatus(event.eventType),
              };
              const Icon = config.icon;
              const createdBy =
                event.createdByUser?.firstName || event.createdByUser?.lastName
                  ? `${event.createdByUser.firstName || ""} ${event.createdByUser.lastName || ""}`.trim()
                  : event.createdByUser?.email || "System";

              return (
                <div key={event.id} className="relative flex gap-3.5">
                  <div
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background ${config.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <span className="font-medium">{config.label}</span>
                      {event.eventType === "STAGE_CHANGE" &&
                        event.previousStage &&
                        event.newStage && (
                          <span className="text-muted-foreground">
                            {formatStatus(event.previousStage)} → {formatStatus(event.newStage)}
                          </span>
                        )}
                      {event.eventType === "OUTCOME_CHANGE" &&
                        event.previousOutcome &&
                        event.newOutcome && (
                          <span className="text-muted-foreground">
                            {formatStatus(event.previousOutcome)} →{" "}
                            {formatStatus(event.newOutcome)}
                          </span>
                        )}
                      {event.eventType === "CONTACT_ATTEMPT" && event.contactMethod && (
                        <span className="text-muted-foreground">
                          via {CONTACT_METHOD_LABELS[event.contactMethod] || event.contactMethod}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {formatDateTime(event.createdAt)} · {createdBy}
                    </p>
                    {event.content && (
                      <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        {event.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
