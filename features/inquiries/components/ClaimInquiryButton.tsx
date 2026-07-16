"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hand } from "lucide-react";

import { claimInquiry } from "@/features/inquiries/inquiry.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";

interface ClaimInquiryButtonProps {
  inquiryId: string;
  className?: string;
}

/** One-tap "this lead is mine": assigns to the caller and moves NEW → CLAIMED. */
export function ClaimInquiryButton({ inquiryId, className }: ClaimInquiryButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function claim() {
    setPending(true);
    const res = await claimInquiry(inquiryId);
    setPending(false);
    if (res.success) {
      toast({ title: "Lead claimed ✓", description: "It's yours — assigned and moved to Claimed." });
      router.refresh();
    } else {
      toast({ title: "Couldn't claim", description: res.error, variant: "destructive" });
    }
  }

  return (
    <button
      type="button"
      onClick={claim}
      disabled={pending}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
        className
      )}
    >
      <Hand className="h-3.5 w-3.5" />
      {pending ? "Claiming…" : "Claim"}
    </button>
  );
}
