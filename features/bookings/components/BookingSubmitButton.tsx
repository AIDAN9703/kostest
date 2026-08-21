"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Checkout CTA for the "Complete your charter" page. Only instant-book boats
 * reach this page (non-instant boats are redirected to the inquiry flow), so
 * the only action is payment — the legacy "send request instead" fallback was
 * retired 2026-08 (it minted a third booking type from the same widget).
 */
interface BookingSubmitButtonProps {
  user?: {
    name?: string | null;
    id: string;
  } | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onNeedAuth?: () => void;
  layout?: "stack" | "bar";
  className?: string;
}

export default function BookingSubmitButton({
  user,
  isSubmitting,
  onSubmit,
  onNeedAuth,
  layout = "stack",
  className,
}: BookingSubmitButtonProps) {
  const needsAuth = !user;
  const isDisabled = isSubmitting;

  const handleClick = () => {
    if (needsAuth) {
      onNeedAuth?.();
      return;
    }
    onSubmit();
  };

  if (layout === "bar") {
    return (
      <Button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "h-11 w-auto shrink-0 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90",
          isDisabled && "opacity-60",
          className
        )}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Payment"}
      </Button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "h-12 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary/90",
          isDisabled && "opacity-60"
        )}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Payment"}
      </Button>

      {user && (
        <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to our Terms of Service and Privacy Policy. Message & data rates
          may apply.
        </p>
      )}
    </div>
  );
}
