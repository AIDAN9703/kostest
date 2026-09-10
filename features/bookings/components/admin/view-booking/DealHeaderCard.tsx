import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * The one deal identity header — both faces of /admin/bookings/[id]
 * (inquiry and booking) render this exact card so an admin never feels a
 * page switch. Just the person: booking number, name + kind chip, where they
 * came from, how to reach them, who owns the deal, one headline number, and
 * the verbs. Trip facts live in Trip details, money in Finances — nothing is
 * repeated here.
 */
export function DealHeaderCard({
  eyebrow,
  name,
  avatarInitials,
  avatarImage,
  avatarClassName,
  typeChip,
  meta,
  contact,
  value,
  actions,
}: {
  eyebrow?: string;
  name: string;
  avatarInitials: string;
  /** Profile picture when the booking is linked to an account. */
  avatarImage?: string | null;
  avatarClassName?: string;
  typeChip?: ReactNode;
  meta?: ReactNode;
  /** The DealContactBand — email / phone / assigned to, editable in edit mode. */
  contact?: ReactNode;
  value?: { label: string; text: string } | null;
  actions?: ReactNode;
}) {
  return (
    // Not a <Card> (the actions column needs its own alignment) but wears the
    // same shell: rounded-2xl border-border/60 bg-card shadow-sm, px-6.
    <header className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0 rounded-2xl ring-1 ring-border/60">
            {avatarImage ? <AvatarImage src={avatarImage} alt="" className="object-cover" /> : null}
            <AvatarFallback
              className={cn(
                "rounded-2xl text-lg font-semibold",
                avatarClassName ?? "bg-muted text-muted-foreground"
              )}
            >
              {avatarInitials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
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

      {/* Contact row gets the FULL width under the top row, flush left with
          the card edge, so Email · Phone · Assigned to stay on one line. */}
      {contact ? <div className="px-6 pb-5 pt-3">{contact}</div> : null}
    </header>
  );
}
