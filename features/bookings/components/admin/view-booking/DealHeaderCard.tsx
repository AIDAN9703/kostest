import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/general-utils";
import { adminInitials } from "@/shared/lib/utils/people-display";

/**
 * The one deal identity header — both faces of /admin/bookings/[id]
 * (lead-phase and booking-phase) render this exact card so a sales agent
 * never feels a page switch: who + how to reach them + where the deal is.
 *
 * Band A: avatar · name + type chip · meta line · value stat + actions
 * Band B: contact strip (plain values with mail/call/WhatsApp affordances)
 * Band C: the pipeline (or terminal-outcome band), passed in as a slot
 */
export function DealHeaderCard({
  eyebrow,
  name,
  avatarInitials,
  avatarClassName,
  typeChip,
  meta,
  value,
  actions,
  email,
  phone,
  ownerName,
  extraContact,
  pipeline,
}: {
  eyebrow?: string;
  name: string;
  avatarInitials: string;
  avatarClassName?: string;
  typeChip?: ReactNode;
  meta?: ReactNode;
  value?: { label: string; text: string } | null;
  actions?: ReactNode;
  email?: string | null;
  phone?: string | null;
  /** Assigned admin display name; null renders the red Unassigned chip. */
  ownerName?: string | null;
  /** Extra labeled fields for the contact strip (e.g. SMS consent). */
  extraContact?: ReactNode;
  pipeline: ReactNode;
}) {
  return (
    // Not a <Card> (multi-band header element) but wears the same shell:
    // rounded-2xl border-border/60 bg-card shadow-sm + px-6 bands.
    <header className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Who */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ring-1 ring-border/60",
              avatarClassName ?? "bg-muted text-muted-foreground"
            )}
          >
            {avatarInitials || "?"}
          </div>
          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
              {typeChip}
            </div>
            {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-5">
          {value ? (
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {value.label}
              </p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums">{value.text}</p>
            </div>
          ) : null}
          {actions}
        </div>
      </div>

      {/* How to reach them — tinted band separates people-info from deal-info */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/50 bg-muted/20 px-6 py-3">
        <ContactField
          label="Email"
          value={email}
        />
        <ContactField label="Phone" value={phone} />
        {/* Who owns this deal — same band, always visible */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Assigned admin
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {ownerName ? (
                <>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-foreground">
                    {adminInitials(ownerName) || "?"}
                  </span>
                  <p className="truncate text-sm font-medium">{ownerName}</p>
                </>
              ) : (
                <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  Unassigned
                </span>
              )}
            </div>
          </div>
        </div>
        {extraContact}
      </div>

      {/* Where the deal is */}
      <div className="border-t border-border/50 px-6 py-3">{pipeline}</div>
    </header>
  );
}

function ContactField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium">
        {value || <span className="text-muted-foreground/40">—</span>}
      </p>
    </div>
  );
}
