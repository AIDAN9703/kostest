"use client";

import React from "react";
import {
  Anchor,
  Archive,
  ArrowRight,
  Circle,
  DollarSign,
  FileText,
  Flag,
  GitBranch,
  History,
  Pencil,
  Phone,
  Send,
  Sparkles,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils/general-utils";
import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";

const CONTACT_LABELS: Record<string, string> = {
  EMAIL: "Email",
  PHONE: "Phone",
  SMS: "SMS",
  IN_PERSON: "In person",
  OTHER: "Other",
};

/**
 * Event categories → icon + bubble tint. One color family per KIND of event
 * so the rail can be skimmed: gold milestones, green money, sky
 * communication, violet people moves, slate edits/audit.
 */
interface EventStyle {
  Icon: LucideIcon;
  bubble: string;
}

const EVENT_STYLES: Record<string, EventStyle> = {
  // Milestones — gold
  [BOOKING_EVENT_TYPES.CREATED]: {
    Icon: Sparkles,
    bubble: "bg-primary-soft text-primary-strong",
  },
  "lead.created": { Icon: Sparkles, bubble: "bg-primary-soft text-primary-strong" },
  [BOOKING_EVENT_TYPES.STATUS_CHANGED]: {
    Icon: GitBranch,
    bubble: "bg-primary-soft text-primary-strong",
  },
  "lead.stage_change": { Icon: GitBranch, bubble: "bg-primary-soft text-primary-strong" },
  [BOOKING_EVENT_TYPES.DRAFT_PUBLISHED]: {
    Icon: Send,
    bubble: "bg-primary-soft text-primary-strong",
  },
  // Money — green
  [BOOKING_EVENT_TYPES.PAYMENT_RECEIVED]: {
    Icon: DollarSign,
    bubble: "bg-success-soft text-success",
  },
  // Communication — sky
  [BOOKING_EVENT_TYPES.CONTACT_LOGGED]: {
    Icon: Phone,
    bubble: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  "lead.contact_attempt": {
    Icon: Phone,
    bubble: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  [BOOKING_EVENT_TYPES.NOTE_ADDED]: {
    Icon: FileText,
    bubble: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  "lead.note": { Icon: FileText, bubble: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  // People — violet
  [BOOKING_EVENT_TYPES.ASSIGNED_ADMIN_CHANGED]: {
    Icon: UserCog,
    bubble: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  "lead.assigned": {
    Icon: UserCog,
    bubble: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  [BOOKING_EVENT_TYPES.ASSIGNED_CAPTAIN_CHANGED]: {
    Icon: Anchor,
    bubble: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  [BOOKING_EVENT_TYPES.CREW_MEMBER_ADDED]: {
    Icon: Users,
    bubble: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  [BOOKING_EVENT_TYPES.CREW_MEMBER_REMOVED]: {
    Icon: Users,
    bubble: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  // Outcome / housekeeping
  "lead.outcome_change": {
    Icon: Flag,
    bubble: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  "deal.archived": { Icon: Archive, bubble: "bg-muted text-muted-foreground" },
  // Edits / audit — slate
  [BOOKING_EVENT_TYPES.UPDATED]: {
    Icon: Pencil,
    bubble: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
};

const FALLBACK_STYLE: EventStyle = { Icon: Circle, bubble: "bg-muted text-muted-foreground" };

function labelForEvent(e: BookingActivityEventEntry) {
  if (e.displayMessage) return e.displayMessage;
  return e.eventType.replace(/^(booking|lead|deal)\./, "").replace(/_/g, " ");
}

/** "PAYMENT_COMPLETE" → "Payment complete" */
function humanize(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function stateValue(
  state: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null {
  if (!state) return null;
  for (const key of keys) {
    const v = state[key];
    if (typeof v === "string" && v) return v;
  }
  return null;
}

const TRANSITION_KEYS = ["bookingStatus", "stage", "outcome", "status"];
const TRANSITION_EVENTS = new Set<string>([
  BOOKING_EVENT_TYPES.STATUS_CHANGED,
  "lead.stage_change",
  "lead.outcome_change",
]);

/** Chip tint by what the destination MEANS: wins green, losses red. */
function toneFor(value: string): string {
  const v = value.toUpperCase();
  if (["WON", "APPROVED", "CONFIRMED", "COMPLETED", "PAID"].includes(v))
    return "bg-success-soft text-success";
  if (["LOST", "CANCELLED", "DENIED", "ABANDONED", "SPAM"].includes(v))
    return "bg-destructive-soft text-destructive";
  return "bg-primary-soft text-primary-strong";
}

function TransitionChips({ from, to }: { from: string | null; to: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {from ? (
        <>
          <span className="rounded-md bg-muted px-1.5 py-px text-[10px] font-bold text-muted-foreground">
            {humanize(from)}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden />
        </>
      ) : null}
      <span className={cn("rounded-md px-1.5 py-px text-[10px] font-bold", toneFor(to))}>
        {humanize(to)}
      </span>
    </span>
  );
}

/**
 * A stage change that has a same-moment companion event saying the same
 * thing in plainer words ("Stage: Claimed → Contacted" next to "Contact
 * logged by Aidan") is noise — keep the human line, drop the robot one.
 */
const COMPANION_EVENTS: Record<string, string[]> = {
  CONTACTED: ["lead.contact_attempt", BOOKING_EVENT_TYPES.CONTACT_LOGGED],
  CLAIMED: ["lead.assigned"],
};

function isRedundantStageChange(
  event: BookingActivityEventEntry,
  all: BookingActivityEventEntry[]
): boolean {
  if (event.eventType !== "lead.stage_change") return false;
  const to = stateValue(event.newState, TRANSITION_KEYS)?.toUpperCase();
  const companions = to ? COMPANION_EVENTS[to] : undefined;
  if (!companions) return false;
  const t = new Date(event.createdAt).getTime();
  return all.some(
    (other) =>
      other.id !== event.id &&
      companions.includes(other.eventType) &&
      Math.abs(new Date(other.createdAt).getTime() - t) < 120_000
  );
}

/** Colored keywords inside sentences: wins green, losses red, milestones gold. */
const good = (word: string) => (
  <strong className="font-bold text-success">{word}</strong>
);
const bad = (word: string) => (
  <strong className="font-bold text-destructive">{word}</strong>
);
const gold = (word: string) => (
  <strong className="font-bold text-primary-strong">{word}</strong>
);

interface EventTitleResult {
  node: React.ReactNode;
  /** True when the actor is already named IN the sentence (meta line skips them). */
  actorShown: boolean;
}

/**
 * Plain-language headline per event: "Aidan claimed this inquiry", "Aidan
 * approved this booking" — the who and the what in one sentence, no
 * robot-speak. Stage data still backs it; this is rendering only.
 */
function buildEventTitle(event: BookingActivityEventEntry): EventTitleResult {
  const actorName =
    event.actorName && event.actorName !== "—" && event.actorName !== "System"
      ? event.actorName
      : null;
  const Actor = actorName ? (
    <strong className="font-semibold">{actorName}</strong>
  ) : null;
  const withActor = (node: React.ReactNode): EventTitleResult => ({
    node,
    actorShown: actorName != null,
  });
  const to = stateValue(event.newState, TRANSITION_KEYS);
  const T = to?.toUpperCase() ?? null;

  switch (event.eventType) {
    case "lead.assigned":
      return withActor(Actor ? <>{Actor} claimed this inquiry</> : <>Inquiry claimed</>);
    case "lead.contact_attempt":
    case BOOKING_EVENT_TYPES.CONTACT_LOGGED:
      return withActor(Actor ? <>{Actor} contacted the customer</> : <>Customer contacted</>);
    case "lead.note":
    case BOOKING_EVENT_TYPES.NOTE_ADDED:
      return withActor(Actor ? <>{Actor} added a note</> : <>Note added</>);
    case BOOKING_EVENT_TYPES.DRAFT_PUBLISHED:
      return withActor(
        Actor ? (
          <>{Actor} sent the {gold("proposal")} to the client</>
        ) : (
          <>{gold("Proposal")} sent to the client</>
        )
      );
    case BOOKING_EVENT_TYPES.UPDATED:
      return withActor(Actor ? <>{Actor} edited the booking</> : <>Booking edited</>);
    case "deal.archived":
      return withActor(Actor ? <>{Actor} archived this deal</> : <>Deal archived</>);
    case "lead.created":
      return withActor(
        Actor ? <>{Actor} logged this inquiry</> : <>Inquiry received</>
      );
    case BOOKING_EVENT_TYPES.CREATED:
      return withActor(Actor ? <>{Actor} created this deal</> : <>Deal created</>);
    case "lead.outcome_change": {
      if (T === "WON")
        return withActor(Actor ? <>{Actor} marked this {good("won")}</> : <>Marked {good("won")}</>);
      if (T && ["LOST", "ABANDONED", "SPAM"].includes(T))
        return withActor(
          Actor ? (
            <>{Actor} marked this {bad(humanize(T).toLowerCase())}</>
          ) : (
            <>Marked {bad(humanize(T).toLowerCase())}</>
          )
        );
      if (to) return { node: <>Outcome set to {gold(humanize(to))}</>, actorShown: false };
      break;
    }
    case "lead.stage_change": {
      if (T === "CONTACTED")
        return withActor(
          Actor ? <>{Actor} contacted the customer</> : <>Customer contacted</>
        );
      if (T === "CLAIMED")
        return withActor(Actor ? <>{Actor} claimed this inquiry</> : <>Inquiry claimed</>);
      if (to) return { node: <>Moved to {gold(humanize(to))}</>, actorShown: false };
      break;
    }
    case BOOKING_EVENT_TYPES.STATUS_CHANGED: {
      if (T === "DRAFT")
        return withActor(
          Actor ? <>{Actor} priced this into a {gold("proposal")}</> : <>Priced into a {gold("proposal")}</>
        );
      if (T === "APPROVED")
        return withActor(
          Actor ? <>{Actor} {good("approved")} this booking</> : <>Booking {good("approved")}</>
        );
      if (T === "CONFIRMED")
        return withActor(
          Actor ? <>{Actor} {good("confirmed")} this booking</> : <>Booking {good("confirmed")}</>
        );
      if (T === "CANCELLED")
        return withActor(
          Actor ? <>{Actor} {bad("cancelled")} this booking</> : <>Booking {bad("cancelled")}</>
        );
      if (T === "COMPLETED") return { node: <>Trip {good("completed")}</>, actorShown: false };
      if (to) return { node: <>Status moved to {gold(humanize(to))}</>, actorShown: false };
      break;
    }
  }

  return { node: <FallbackTitle event={event} />, actorShown: false };
}

/**
 * Fallback headline for event types without a sentence template: "A → B"
 * strings get bold endpoints, dollar amounts render bold green.
 */
function FallbackTitle({ event }: { event: BookingActivityEventEntry }) {
  if (TRANSITION_EVENTS.has(event.eventType)) {
    const to = stateValue(event.newState, TRANSITION_KEYS);
    if (to) {
      return (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>Moved</span>
          <TransitionChips from={stateValue(event.previousState, TRANSITION_KEYS)} to={to} />
        </span>
      );
    }
  }

  const text = labelForEvent(event);

  // "Prefix: A → B" → bold both endpoints around a real arrow icon.
  const arrow = text.match(/^(.*?):?\s*(\S[^→]*?)\s*→\s*(.+)$/);
  if (arrow && text.includes("→")) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1">
        {arrow[1] ? <span>{arrow[1].replace(/:$/, "")}</span> : null}
        <strong className="font-semibold">{arrow[2]}</strong>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden />
        <strong className="font-semibold">{arrow[3]}</strong>
      </span>
    );
  }

  // Bold + green any dollar amounts ("Payment received $1,200.00").
  const parts = text.split(/(\$[\d,]+(?:\.\d{2})?)/g);
  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith("$") ? (
            <strong key={i} className="font-bold text-success">
              {part}
            </strong>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  }

  return <>{text}</>;
}

function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, date.getFullYear() === new Date().getFullYear() ? "EEE, MMM d" : "MMM d, yyyy");
}

export function BookingActivityTimeline({
  events,
  className,
}: {
  events: BookingActivityEventEntry[];
  /** e.g. sticky rail on booking detail: lg:sticky lg:top-20 … */
  className?: string;
}) {
  // Drop stage-change lines that repeat an adjacent human event.
  const visibleEvents = events.filter((e) => !isRedundantStageChange(e, events));

  // Group into calendar days (events arrive newest-first; keep that order).
  const dayGroups: { key: string; label: string; items: BookingActivityEventEntry[] }[] = [];
  for (const event of visibleEvents) {
    const d = new Date(event.createdAt);
    const key = format(d, "yyyy-MM-dd");
    const last = dayGroups[dayGroups.length - 1];
    if (last && last.key === key) last.items.push(event);
    else dayGroups.push({ key, label: dayLabel(d), items: [event] });
  }

  return (
    <Card
      className={`flex flex-col overflow-hidden lg:max-h-[calc(100vh-5.5rem)] ${className ?? ""}`}
    >
      <CardHeader className="shrink-0 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />
          Activity
          {visibleEvents.length > 0 ? (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {visibleEvents.length}
            </span>
          ) : null}
        </CardTitle>
        <CardDescription className="text-xs">
          Everything that happened on this deal, newest first
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pb-4 [-ms-overflow-style:none] [scrollbar-gutter:stable]">
        {visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <History className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Status changes, notes, payments, and contacts will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {dayGroups.map((group) => (
              <section key={group.key}>
                {/* Day divider */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-border/70" aria-hidden />
                </div>

                <div className="relative">
                  <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border/70" aria-hidden />
                  <div className="space-y-4">
                    {group.items.map((event) => {
                      const { Icon, bubble } = EVENT_STYLES[event.eventType] ?? FALLBACK_STYLE;
                      const title = buildEventTitle(event);
                      return (
                        <div
                          key={event.id}
                          className="relative -mx-1.5 flex gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted/40"
                        >
                          <div
                            className={cn(
                              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                              bubble
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium leading-snug text-foreground">
                              {title.node}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                              <span
                                className="tabular-nums"
                                title={new Date(event.createdAt).toISOString()}
                              >
                                {format(new Date(event.createdAt), "h:mm a")}
                              </span>
                              {!title.actorShown && event.actorName !== "—" ? (
                                <>
                                  <span aria-hidden>·</span>
                                  <span className="truncate font-medium text-foreground/70">
                                    {event.actorName}
                                  </span>
                                </>
                              ) : null}
                              {event.contactMethod ? (
                                <span className="rounded bg-muted px-1 py-px text-[10px]">
                                  {CONTACT_LABELS[event.contactMethod] ?? event.contactMethod}
                                </span>
                              ) : null}
                              {event.channel ? (
                                <span className="rounded bg-muted px-1 py-px text-[10px]">
                                  {event.channel}
                                </span>
                              ) : null}
                            </p>

                            {event.content ? (
                              <div className="mt-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
                                <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                                  {event.content}
                                </p>
                              </div>
                            ) : null}

                            {event.metadata?.reason != null &&
                              typeof event.metadata.reason === "string" && (
                                <p className="mt-1 text-[11px] italic text-muted-foreground">
                                  “{event.metadata.reason}”
                                </p>
                              )}

                            {event.eventType === BOOKING_EVENT_TYPES.DRAFT_PUBLISHED &&
                              event.metadata?.publicToken != null && (
                                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                  Link token …{String(event.metadata.publicToken).slice(-8)}
                                </p>
                              )}

                            {event.eventType === BOOKING_EVENT_TYPES.UPDATED &&
                              Array.isArray(event.metadata?.changedFields) &&
                              event.metadata.changedFields.length > 0 && (
                                <details className="mt-1.5 text-xs">
                                  <summary className="cursor-pointer select-none text-[11px] text-muted-foreground hover:text-foreground">
                                    {event.metadata.changedFields.length} field
                                    {event.metadata.changedFields.length !== 1 ? "s" : ""} changed
                                  </summary>
                                  <ul className="mt-1.5 space-y-1.5 rounded-md border border-border/60 bg-muted/30 p-2 font-mono">
                                    {(event.metadata.changedFields as string[]).map((field) => (
                                      <li key={field} className="break-all text-[11px]">
                                        <span className="font-semibold text-foreground/80">{field}</span>
                                        {event.previousState &&
                                          field in event.previousState &&
                                          event.newState &&
                                          field in event.newState && (
                                            <span className="block pl-2 leading-relaxed">
                                              <span className="text-destructive">
                                                − {String((event.previousState as Record<string, unknown>)[field])}
                                              </span>
                                              <br />
                                              <span className="text-success">
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
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
