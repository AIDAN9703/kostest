"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { markBookingPaidOfflineAction } from "@/features/bookings/actions/mark-booking-paid.actions";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";

interface AdminBookingMarkPaidButtonProps {
  bookingId: string;
  /** Quote total (booking pricing) — fallback when ops GMV is empty */
  charterTotalCents: number | null;
  /** Sum of succeeded, non-refund payments (matches Payment card “Total paid”) */
  totalPaidFromPaymentsCents: number;
  opsGmvCents: number | null;
  currentPaidCents: number | null;
  clientPaid: boolean | null;
}

/**
 * Offline / Zelle: updates ops PAID + client paid **and** inserts a manual payment for any
 * gap so Total paid, balance, and payment history stay aligned with Stripe records.
 */
export function AdminBookingMarkPaidButton({
  bookingId,
  charterTotalCents,
  totalPaidFromPaymentsCents,
  opsGmvCents,
  currentPaidCents,
  clientPaid,
}: AdminBookingMarkPaidButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const targetGmvCents =
    opsGmvCents != null && opsGmvCents > 0 ? opsGmvCents : charterTotalCents ?? null;

  const paidOps = currentPaidCents ?? 0;
  const recorded = totalPaidFromPaymentsCents ?? 0;

  const fullySynced =
    targetGmvCents != null &&
    targetGmvCents > 0 &&
    paidOps >= targetGmvCents &&
    clientPaid === true &&
    recorded >= targetGmvCents;

  const disabled =
    pending ||
    targetGmvCents == null ||
    targetGmvCents <= 0 ||
    fullySynced;

  async function handleClick() {
    if (targetGmvCents == null || targetGmvCents <= 0) return;
    setPending(true);
    try {
      const res = await markBookingPaidOfflineAction(bookingId);
      if (res.success) {
        router.refresh();
      } else {
        toast({
          title: "Could not mark paid",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="h-11 shrink-0 rounded-xl gap-2 border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/60"
      disabled={disabled}
      onClick={handleClick}
      title="Adds a succeeded manual payment for any amount not already in payment history, then sets ops PAID + client paid."
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      Mark as paid
      {targetGmvCents != null && targetGmvCents > 0 ? (
        <span className="tabular-nums">({formatCentsAsCurrency(targetGmvCents)})</span>
      ) : null}
    </Button>
  );
}
