"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight, FileEdit, CreditCard, Banknote, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { acceptDraftBookingAction } from "@/features/bookings/actions/draft-booking-actions";

interface DraftProposalActionsProps {
  publicToken: string;
  customerNote: string;
  onCustomerNoteChange: (note: string) => void;
  allowPayment: boolean;
  isAccepted: boolean;
  depositAmountCents: number | null;
  totalAmountCents: number;
}

export function DraftProposalActions({
  publicToken,
  customerNote,
  onCustomerNoteChange,
  allowPayment,
  isAccepted,
  depositAmountCents,
  totalAmountCents,
}: DraftProposalActionsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");

  const hasDeposit = depositAmountCents != null && depositAmountCents > 0;

  const handlePay = (chargeType: "deposit" | "full") => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("payNow", "true");
      formData.set("customerNote", customerNote);
      formData.set("chargeType", chargeType);

      const result = await acceptDraftBookingAction(
        { success: false },
        formData
      );

      if (result.success && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  const handleAcceptNoPay = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("publicToken", publicToken);
      formData.set("payNow", "false");
      formData.set("customerNote", customerNote);

      const result = await acceptDraftBookingAction(
        { success: false },
        formData
      );

      if (result.success) {
        window.location.reload();
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  if (isAccepted) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>
          Booking accepted. Our team will follow up with payment details.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Link href="/profile/bookings">
          <Button variant="outline" size="lg" className="w-full gap-2">
            <ArrowRight className="h-4 w-4" />
            View in profile
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => {
            setRequestNote(customerNote);
            setRequestModalOpen(true);
          }}
        >
          <FileEdit className="h-4 w-4" />
          Request changes
        </Button>
      </div>

      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Describe what you&apos;d like to adjust. Your message will be sent when you accept or pay.
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
              onClick={() => {
                onCustomerNoteChange(requestNote);
                setRequestModalOpen(false);
              }}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {allowPayment && (
        <>
          {hasDeposit && (
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={pending}
              onClick={() => handlePay("deposit")}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Pay deposit
            </Button>
          )}
          <Button
            size="lg"
            className="w-full gap-2"
            disabled={pending}
            onClick={() => handlePay("full")}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Banknote className="h-4 w-4" />
            )}
            Pay in full
          </Button>
        </>
      )}

      {!allowPayment && (
        <Button
          size="lg"
          className="w-full"
          disabled={pending}
          onClick={handleAcceptNoPay}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Accept"
          )}
        </Button>
      )}
    </div>
  );
}
