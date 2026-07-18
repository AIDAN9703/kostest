"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hand } from "lucide-react";

import { claimDeal } from "@/features/bookings/actions/deal.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

interface ClaimDealButtonProps {
  bookingId: string;
  className?: string;
}

/** One-click "this lead is mine" — assigns the deal to the current admin. */
export function ClaimDealButton({ bookingId, className }: ClaimDealButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function claim() {
    if (pending) return;
    setPending(true);
    const res = await claimDeal(bookingId);
    setPending(false);
    if (res.success) {
      router.refresh();
    } else {
      toast({ title: "Couldn't claim deal", description: res.error, variant: "destructive" });
    }
  }

  return (
    <button
      type="button"
      onClick={claim}
      disabled={pending}
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
        className
      )}
    >
      <Hand className="h-3 w-3" />
      {pending ? "Claiming…" : "Claim"}
    </button>
  );
}
