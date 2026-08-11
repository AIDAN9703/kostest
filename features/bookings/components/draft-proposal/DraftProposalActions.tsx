"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CreditCard, FileEdit, Loader2, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  acceptDraftBookingAction,
  requestDraftChangesAction,
} from "@/features/bookings/actions/draft-booking-actions";

interface DraftProposalActionsProps {
  publicToken: string;
  allowPayment: boolean;
  /** Admin's choice at proposal time: which charge secures the date. */
  paymentType: "DEPOSIT_ONLY" | "FULL_PAYMENT" | null;
  isAccepted: boolean;
  totalPaidCents: number;
  depositAmountCents: number | null;
  totalAmountCents: number;
}

/**
 * The proposal's action rail, driven by where the deal actually is:
 *
 * 1. Open (not accepted):  "Looks good — continue to payment" (or plain
 *    Accept when payment isn't enabled) + Request changes.
 * 2. Accepted, unpaid:     accepted banner + Complete payment (returning
 *    visitors keep their payment path — accepting isn't a dead end).
 * 3. Paid:                 confirmation banner.
 *
 * One payment button, honoring the admin's deposit-vs-full choice. Change
 * requests send immediately and land on the admin's activity timeline.
 */
export function DraftProposalActions({
  publicToken,
  allowPayment,
  paymentType,
  isAccepted,
  totalPaidCents,
  depositAmountCents,
  totalAmountCents,
}: DraftProposalActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestPending, startRequestTransition] = useTransition();

  const isPaid = totalPaidCents > 0;
  const hasDeposit = depositAmountCents != null && depositAmountCents > 0;
  // Deposit secures the date only when the admin chose it AND an amount exists.
  const chargeType: "deposit" | "full" =
    paymentType === "DEPOSIT_ONLY" && hasDeposit ? "deposit" : "full";
  const chargeAmountCents = chargeType === "deposit" ? depositAmountCents! : totalAmountCents;

  const handlePay = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("payNow", "true");
      formData.set("chargeType", chargeType);

      const result = await acceptDraftBookingAction({ success: false }, formData);
      if (result.success && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else if (result.error) {
        setError(result.error);
      } else {
        setError("Couldn't open the payment page. Please try again.");
      }
    });
  };

  const handleAcceptNoPay = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("payNow", "false");

      const result = await acceptDraftBookingAction({ success: false }, formData);
      if (result.success) {
        window.location.reload();
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  const handleSendChangeRequest = () => {
    startRequestTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("message", requestNote);

      const result = await requestDraftChangesAction({ success: false }, formData);
      if (result.success) {
        setRequestSent(true);
        setRequestNote("");
        setRequestModalOpen(false);
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  const requestChangesButton = (
    <Button
      variant="outline"
      size="lg"
      className="h-11 w-full gap-2 rounded-full border-0 bg-foreground/10 text-primary hover:bg-foreground/15 hover:text-primary"
      disabled={requestPending}
      onClick={() => setRequestModalOpen(true)}
    >
      <FileEdit className="h-4 w-4" />
      Request changes
    </Button>
  );

  const requestChangesDialog = (
    <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tell us what you&apos;d like to adjust — our team gets it instantly and will update
          your proposal.
        </p>
        <div className="space-y-2">
          <Label htmlFor="request-note">Your message</Label>
          <Textarea
            id="request-note"
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            placeholder="e.g. Change pickup time to 2pm, add champagne..."
            className="min-h-[100px] resize-none"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSendChangeRequest}
            disabled={requestPending || !requestNote.trim()}
            className="gap-2"
          >
            {requestPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const requestSentNote = requestSent ? (
    <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
      Change request sent — our team will follow up shortly.
    </p>
  ) : null;

  // ── Paid: the journey is complete ──
  if (isPaid) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Payment received — you&apos;re booked! A confirmation email is on its way.
          </span>
        </div>
        {requestSentNote}
        {requestChangesButton}
        {requestChangesDialog}
      </div>
    );
  }

  // ── Accepted, unpaid: keep the payment door open ──
  if (isAccepted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            {allowPayment
              ? "Proposal accepted — complete your payment below to lock in your date."
              : "Proposal accepted. Our team will follow up with payment details."}
          </span>
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        {requestSentNote}
        {allowPayment && (
          <Button size="lg" className="h-11 w-full gap-2 rounded-full" disabled={pending} onClick={handlePay}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {chargeType === "deposit"
              ? `Pay ${formatCentsAsCurrency(chargeAmountCents)} deposit`
              : `Complete payment · ${formatCentsAsCurrency(chargeAmountCents)}`}
          </Button>
        )}
        {requestChangesButton}
        {requestChangesDialog}
      </div>
    );
  }

  // ── Open proposal ──
  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {requestSentNote}

      {allowPayment ? (
        <>
          <Button size="lg" className="h-11 w-full gap-2 rounded-full" disabled={pending} onClick={handlePay}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Looks good — continue to payment
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {chargeType === "deposit"
              ? `You'll pay the ${formatCentsAsCurrency(chargeAmountCents)} deposit now to secure your date.`
              : `You'll pay ${formatCentsAsCurrency(chargeAmountCents)} to secure your date.`}
          </p>
        </>
      ) : (
        <Button size="lg" className="h-11 w-full rounded-full" disabled={pending} onClick={handleAcceptNoPay}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Accept proposal"
          )}
        </Button>
      )}

      {requestChangesButton}
      {requestChangesDialog}
    </div>
  );
}
