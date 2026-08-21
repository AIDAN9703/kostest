"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Check, Copy, Pencil, Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import { sendProposalUpdate, shareProposalLink } from "@/features/bookings/actions/deal.actions";

/**
 * There is exactly ONE customer-facing link per deal — the proposal page,
 * which also takes payment at every stage. Everything about telling the
 * customer "look again" lives here: the Update trip button, the
 * after-editing prompt, and the ⋯-menu resend item all open the same dialog.
 */
export interface ProposalResendContext {
  bookingId: string;
  publicToken: string;
  /** "proposal" while DRAFT; "payment" once accepted with money still owed. */
  stage: "proposal" | "payment";
  customerEmail: string | null;
  customerPhone: string | null;
  /** Admin edits logged since the customer last got the link. */
  editsSinceSend: number;
}

const BookingEditModeContext = createContext<{
  editing: boolean;
  setEditing: (editing: boolean) => void;
  resend: ProposalResendContext | null;
  openResend: () => void;
}>({ editing: false, setEditing: () => {}, resend: null, openResend: () => {} });

export function BookingEditModeProvider({
  children,
  resend = null,
}: {
  children: ReactNode;
  /** Null when there is nothing to resend (no link yet, or deal settled). */
  resend?: ProposalResendContext | null;
}) {
  const [editing, setEditingState] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Finishing an edit session is the moment the customer's copy goes stale —
  // offer the resend right there.
  const setEditing = (next: boolean) => {
    setEditingState(next);
    if (!next && editing && resend) setDialogOpen(true);
  };

  return (
    <BookingEditModeContext.Provider
      value={{ editing, setEditing, resend, openResend: () => setDialogOpen(true) }}
    >
      {children}
      {resend ? (
        <ProposalResendDialog resend={resend} open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : null}
    </BookingEditModeContext.Provider>
  );
}

export function useBookingEditMode() {
  return useContext(BookingEditModeContext);
}

/** The ⋯ menu uses this to offer "Resend proposal/payment link". */
export function useProposalResend() {
  const { resend, openResend } = useContext(BookingEditModeContext);
  return { resend, openResend };
}

export function BookingPageEditButton() {
  const { editing, setEditing } = useBookingEditMode();
  return (
    <Button
      variant="outline"
      size="sm"
      // Toolbar pill: visible gray fill (bg-muted blends into the card), gold text.
      className="shrink-0 gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong"
      onClick={() => setEditing(!editing)}
    >
      {editing ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Done updating
        </>
      ) : (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Update trip
        </>
      )}
    </Button>
  );
}

/**
 * "Tell the customer" — email/text the one proposal link. Opens after an
 * edit session ends and from the ⋯ menu; same dialog, same action.
 */
function ProposalResendDialog({
  resend,
  open,
  onOpenChange,
}: {
  resend: ProposalResendContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [emailChecked, setEmailChecked] = useState(Boolean(resend.customerEmail));
  const [smsChecked, setSmsChecked] = useState(false);
  const [sending, setSending] = useState(false);

  const isProposal = resend.stage === "proposal";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/bookings/draft/${resend.publicToken}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Copying = publishing: first share activates the link server-side.
    void shareProposalLink(resend.bookingId);
  }

  async function handleSend() {
    setSending(true);
    try {
      const result = await sendProposalUpdate(resend.bookingId, {
        email: emailChecked,
        sms: smsChecked,
      });
      if (result.success) {
        toast({ title: "Sent", description: result.message });
        onOpenChange(false);
      } else {
        toast({ title: "Not sent", description: result.error, variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isProposal ? "Send the updated proposal?" : "Resend the payment link?"}
          </DialogTitle>
          <DialogDescription>
            {isProposal
              ? "The customer keeps one link — it always shows the latest version of this trip."
              : "Same link as the proposal — it now takes them straight to payment."}
            {resend.editsSinceSend > 0 ? (
              <span className="mt-1.5 block text-warning">
                {resend.editsSinceSend} {resend.editsSinceSend === 1 ? "change" : "changes"} since
                they last got it.
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-1">
          <label
            className={cn("flex items-center gap-2.5 text-sm", !resend.customerEmail && "opacity-40")}
          >
            <Checkbox
              checked={emailChecked}
              onCheckedChange={(v) => setEmailChecked(v === true)}
              disabled={!resend.customerEmail}
            />
            <span>
              Email{" "}
              <span className="text-xs text-muted-foreground">
                {resend.customerEmail ?? "none on file"}
              </span>
            </span>
          </label>
          <label
            className={cn("flex items-center gap-2.5 text-sm", !resend.customerPhone && "opacity-40")}
          >
            <Checkbox
              checked={smsChecked}
              onCheckedChange={(v) => setSmsChecked(v === true)}
              disabled={!resend.customerPhone}
            />
            <span>
              Text{" "}
              <span className="text-xs text-muted-foreground">
                {resend.customerPhone ?? "none on file"}
              </span>
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 rounded-full text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <span className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Not now
          </Button>
          <Button
            type="button"
            className="gap-1.5 rounded-full px-5"
            onClick={handleSend}
            disabled={sending || (!emailChecked && !smsChecked)}
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : "Send"}
          </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
