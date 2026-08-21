"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, Copy, Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { formatBoatLocal } from "@/shared/lib/utils/date-helpers";
import {
  sendProposalUpdate,
  shareProposalLink,
} from "@/features/bookings/actions/deal.actions";

interface ProposalCardProps {
  bookingId: string;
  publicToken: string;
  /** Null until the link has been shared/sent for the first time. */
  publishedAt: Date | null;
  /** Admin edits logged since the last send — the "you changed things, tell
      the customer" nudge. */
  changesSinceLastSend: number;
  customerEmail: string | null;
  customerPhone: string | null;
  /** Summary facts — what the customer will see when they open the link. */
  boatLabel: string;
  tripStart: Date | null;
  boatTimezone: string | null;
  guests: number | null;
  totalAmountCents: number | null;
  currency: string;
}

/**
 * The proposal, as one card: what the customer sees, when they last saw it,
 * and the resend controls. One deal = one link forever — edits update the
 * page behind the same URL, and this card is how the admin tells the
 * customer to look again.
 */
export function ProposalCard({
  bookingId,
  publicToken,
  publishedAt,
  changesSinceLastSend,
  customerEmail,
  customerPhone,
  boatLabel,
  tripStart,
  boatTimezone,
  guests,
  totalAmountCents,
  currency,
}: ProposalCardProps) {
  const { toast } = useToast();
  const [emailChecked, setEmailChecked] = useState(Boolean(customerEmail));
  const [smsChecked, setSmsChecked] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const proposalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/bookings/draft/${publicToken}`;
  const needsResend = publishedAt != null && changesSinceLastSend > 0;

  async function handleCopy() {
    await navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Copying = publishing; activates the link server-side on first share.
    const result = await shareProposalLink(bookingId);
    if (!result.success) {
      toast({ title: "Link copied, but…", description: result.error, variant: "destructive" });
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const result = await sendProposalUpdate(bookingId, {
        email: emailChecked,
        sms: smsChecked,
      });
      if (result.success) {
        toast({ title: "Sent", description: result.message });
      } else {
        toast({ title: "Not sent", description: result.error, variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg">
          Proposal
          <span className="text-sm font-normal text-muted-foreground">
            {publishedAt
              ? `sent ${format(new Date(publishedAt), "MMM d, h:mm a")}`
              : "not sent yet"}
          </span>
          {needsResend ? (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
              {changesSinceLastSend} {changesSinceLastSend === 1 ? "edit" : "edits"} since last send
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What the customer sees when they open the link. */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Boat</dt>
            <dd className="mt-0.5 truncate font-medium">{boatLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Trip start</dt>
            <dd className="mt-0.5 font-medium">
              {tripStart ? formatBoatLocal(tripStart, boatTimezone, "MMM d · h:mm a zzz") : "TBD"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Guests</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{guests ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Total</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {totalAmountCents != null
                ? formatCentsAsCurrency(totalAmountCents, { currency })
                : "—"}
            </dd>
          </div>
        </dl>

        {/* The one link. */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {proposalUrl}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1.5 rounded-full px-3 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Resend controls: pick channels, one button. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <label
              className={cn(
                "flex items-center gap-2 text-sm",
                !customerEmail && "opacity-40"
              )}
            >
              <Checkbox
                checked={emailChecked}
                onCheckedChange={(v) => setEmailChecked(v === true)}
                disabled={!customerEmail}
              />
              <span>
                Email
                {customerEmail ? (
                  <span className="ml-1 text-xs text-muted-foreground">{customerEmail}</span>
                ) : (
                  <span className="ml-1 text-xs text-muted-foreground">none on file</span>
                )}
              </span>
            </label>
            <label
              className={cn("flex items-center gap-2 text-sm", !customerPhone && "opacity-40")}
            >
              <Checkbox
                checked={smsChecked}
                onCheckedChange={(v) => setSmsChecked(v === true)}
                disabled={!customerPhone}
              />
              <span>
                Text
                {customerPhone ? (
                  <span className="ml-1 text-xs text-muted-foreground">{customerPhone}</span>
                ) : (
                  <span className="ml-1 text-xs text-muted-foreground">none on file</span>
                )}
              </span>
            </label>
          </div>
          <Button
            type="button"
            className="gap-1.5 rounded-full px-5"
            disabled={sending || (!emailChecked && !smsChecked)}
            onClick={handleSend}
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : publishedAt ? "Send update" : "Send proposal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
