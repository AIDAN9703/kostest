import type { ReactNode } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { cn } from "@/shared/lib/utils/general-utils";

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
  /** Extra labeled fields for the contact strip (e.g. SMS consent). */
  extraContact?: ReactNode;
  pipeline: ReactNode;
}) {
  const phoneDigits = phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <header className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:col-span-2">
      {/* Who */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-semibold",
              avatarClassName ?? "bg-muted text-muted-foreground"
            )}
          >
            {avatarInitials || "?"}
          </div>
          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
              {typeChip}
            </div>
            {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-4">
          {value ? (
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {value.label}
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums">{value.text}</p>
            </div>
          ) : null}
          {actions}
        </div>
      </div>

      {/* How to reach them */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/50 px-5 py-3">
        <ContactField
          label="Email"
          value={email}
          actions={
            email ? (
              <ContactIconLink href={`mailto:${email}`} label="Send email">
                <Mail className="h-3.5 w-3.5" />
              </ContactIconLink>
            ) : null
          }
        />
        <ContactField
          label="Phone"
          value={phone}
          actions={
            phone ? (
              <>
                <ContactIconLink href={`tel:${phoneDigits}`} label="Call">
                  <Phone className="h-3.5 w-3.5" />
                </ContactIconLink>
                <ContactIconLink
                  href={`https://wa.me/${phoneDigits.replace(/^\+/, "")}`}
                  label="WhatsApp"
                  external
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </ContactIconLink>
              </>
            ) : null
          }
        />
        {extraContact}
      </div>

      {/* Where the deal is */}
      <div className="border-t border-border/50 px-5 py-3">{pipeline}</div>
    </header>
  );
}

function ContactField({
  label,
  value,
  actions,
}: {
  label: string;
  value: string | null | undefined;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium">
          {value || <span className="text-muted-foreground/40">—</span>}
        </p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

function ContactIconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </a>
  );
}
