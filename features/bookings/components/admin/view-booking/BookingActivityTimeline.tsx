"use client";

import {
  Anchor,
  Circle,
  FileText,
  GitBranch,
  Link2,
  Pencil,
  Phone,
  Sparkles,
  UserCog,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDateTimeWithSeconds } from "@/shared/lib/utils/general-utils";
import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";

const CONTACT_LABELS: Record<string, string> = {
  EMAIL: "Email",
  PHONE: "Phone",
  SMS: "SMS",
  IN_PERSON: "In person",
  OTHER: "Other",
};

function iconForEvent(eventType: string) {
  if (eventType === BOOKING_EVENT_TYPES.CREATED) return Sparkles;
  if (eventType === BOOKING_EVENT_TYPES.STATUS_CHANGED) return GitBranch;
  if (eventType === BOOKING_EVENT_TYPES.CONTACT_LOGGED) return Phone;
  if (eventType === BOOKING_EVENT_TYPES.NOTE_ADDED) return FileText;
  if (eventType === BOOKING_EVENT_TYPES.UPDATED) return Pencil;
  if (eventType === BOOKING_EVENT_TYPES.ASSIGNED_ADMIN_CHANGED) return UserCog;
  if (eventType === BOOKING_EVENT_TYPES.ASSIGNED_CAPTAIN_CHANGED) return Anchor;
  if (eventType === BOOKING_EVENT_TYPES.DRAFT_PUBLISHED) return Link2;
  return Circle;
}

function labelForEvent(e: BookingActivityEventEntry) {
  if (e.displayMessage) return e.displayMessage;
  return e.eventType.replace(/^booking\./, "").replace(/_/g, " ");
}

export function BookingActivityTimeline({
  events,
  className,
}: {
  events: BookingActivityEventEntry[];
  /** e.g. sticky rail on booking detail: lg:sticky lg:top-20 … */
  className?: string;
}) {
  return (
    <Card
      className={`flex flex-col overflow-hidden lg:max-h-[calc(100vh-5.5rem)] ${className ?? ""}`}
    >
      <CardHeader className="shrink-0 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Circle className="h-4 w-4" />
          Activity &amp; audit
        </CardTitle>
        <CardDescription className="text-xs">
          {events.length === 0
            ? "No activity yet"
            : `${events.length} event${events.length !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pb-4 [-ms-overflow-style:none] [scrollbar-gutter:stable]">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Status changes, notes, and contacts will show here.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-6">
              {events.map((event) => {
                const Icon = iconForEvent(event.eventType);
                return (
                  <div key={event.id} className="relative flex gap-4 pl-2">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 pb-6">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{labelForEvent(event)}</span>
                        <span
                          className="text-muted-foreground tabular-nums"
                          title={new Date(event.createdAt).toISOString()}
                        >
                          {formatDateTimeWithSeconds(event.createdAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {event.actorName}
                        </span>
                        {event.channel && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {event.channel}
                          </span>
                        )}
                      </div>
                      {event.contactMethod && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Via {CONTACT_LABELS[event.contactMethod] ?? event.contactMethod}
                        </p>
                      )}
                      {event.content && (
                        <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2">
                          <p className="whitespace-pre-wrap text-sm">{event.content}</p>
                        </div>
                      )}
                      {event.metadata?.reason != null &&
                        typeof event.metadata.reason === "string" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reason: {event.metadata.reason}
                          </p>
                        )}
                      {event.eventType === BOOKING_EVENT_TYPES.DRAFT_PUBLISHED &&
                        event.metadata?.publicToken != null && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            Link token…{String(event.metadata.publicToken).slice(-8)}
                          </p>
                        )}
                      {event.eventType === BOOKING_EVENT_TYPES.UPDATED &&
                        Array.isArray(event.metadata?.changedFields) &&
                        event.metadata.changedFields.length > 0 && (
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Field changes ({event.metadata.changedFields.length})
                            </summary>
                            <ul className="mt-2 space-y-1 rounded-md bg-muted/40 p-2 font-mono">
                              {(event.metadata.changedFields as string[]).map((field) => (
                                <li key={field} className="break-all">
                                  <span className="text-muted-foreground">{field}</span>
                                  {event.previousState &&
                                    field in event.previousState &&
                                    event.newState &&
                                    field in event.newState && (
                                      <span className="block pl-2 text-[11px] leading-relaxed">
                                        <span className="text-red-600/90 dark:text-red-400">
                                          − {String((event.previousState as Record<string, unknown>)[field])}
                                        </span>
                                        <br />
                                        <span className="text-emerald-600/90 dark:text-emerald-400">
                                          + {String((event.newState as Record<string, unknown>)[field])}
                                        </span>
                                      </span>
                                    )}
                                </li>
                              ))}
                            </ul>
                          </details>
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
