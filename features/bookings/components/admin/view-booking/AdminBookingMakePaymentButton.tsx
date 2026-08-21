"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { recordBookingManualPaymentAction } from "@/features/bookings/actions/mark-booking-paid.actions";
import { centsToDollars, dollarsToCents, formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

interface AdminBookingMakePaymentButtonProps {
  bookingId: string;
  /** Quote total (booking pricing) — fallback when ops GMV is empty */
  charterTotalCents: number | null;
  /** Sum of succeeded, non-refund payments (matches Payment card “Total paid”) */
  totalPaidFromPaymentsCents: number;
  opsGmvCents: number | null;
}

function parseDollarsInput(raw: string): number | null {
  const t = raw.trim().replace(/^\$/, "").replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function AdminBookingMakePaymentButton({
  bookingId,
  charterTotalCents,
  totalPaidFromPaymentsCents,
  opsGmvCents,
}: AdminBookingMakePaymentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [amountInput, setAmountInput] = useState("");

  const targetGmvCents =
    opsGmvCents != null && opsGmvCents > 0 ? opsGmvCents : charterTotalCents ?? null;
  const recorded = totalPaidFromPaymentsCents ?? 0;

  const remainingCents = useMemo(() => {
    if (targetGmvCents == null || targetGmvCents <= 0) return 0;
    return Math.max(0, targetGmvCents - recorded);
  }, [targetGmvCents, recorded]);

  const disabled =
    targetGmvCents == null || targetGmvCents <= 0 || remainingCents <= 0;

  useEffect(() => {
    if (!open) {
      setAmountInput("");
    }
  }, [open]);

  function applyFullBalance() {
    if (remainingCents <= 0) return;
    setAmountInput(String(centsToDollars(remainingCents)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dollars = parseDollarsInput(amountInput);
    if (dollars == null) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive dollar amount.",
        variant: "destructive",
      });
      return;
    }
    const cents = dollarsToCents(dollars);
    if (cents <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive dollar amount.",
        variant: "destructive",
      });
      return;
    }
    if (cents > remainingCents) {
      toast({
        title: "Too much",
        description: `Remaining balance is ${formatCentsAsCurrency(remainingCents)}.`,
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      const res = await recordBookingManualPaymentAction(bookingId, cents);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Could not record payment",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        // Header-pill style (soft fill, no border), kept green — money in.
        className="shrink-0 gap-1.5 rounded-full border-0 bg-success px-4 font-semibold text-success-foreground hover:bg-success/85"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Manual payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record manual payment</DialogTitle>
            <DialogDescription>
              Add an offline payment (cash, check, Zelle, etc.) to the ledger. Remaining before
              this payment:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatCentsAsCurrency(remainingCents)}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-payment-amount">Amount (USD)</Label>
              <Input
                id="manual-payment-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                disabled={pending}
                className="rounded-xl"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              disabled={pending || remainingCents <= 0}
              onClick={applyFullBalance}
            >
              Use full remaining balance ({formatCentsAsCurrency(remainingCents)})
            </Button>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl gap-2" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Record payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
