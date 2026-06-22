"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils/general-utils";

interface BookingSubmitButtonProps {
  user?: {
    name?: string | null;
    id: string;
  } | null;
  boat: {
    instantBook: boolean;
  };
  isSubmitting: boolean;
  onSubmit: (paymentMethod: "request" | "instant") => void;
  onNeedAuth?: () => void;
  layout?: "stack" | "bar";
  className?: string;
}

export default function BookingSubmitButton({
  user,
  boat,
  isSubmitting,
  onSubmit,
  onNeedAuth,
  layout = "stack",
  className,
}: BookingSubmitButtonProps) {
  const needsAuth = !user;
  const isDisabled = isSubmitting;

  const handleClick = (method: "request" | "instant") => {
    if (needsAuth) {
      onNeedAuth?.();
      return;
    }
    onSubmit(method);
  };

  const primaryLabel = boat.instantBook ? "Continue to Payment" : "Send Booking Request";
  const primaryMethod = boat.instantBook ? "instant" : "request";

  if (layout === "bar") {
    return (
      <Button
        type="button"
        onClick={() => handleClick(primaryMethod)}
        disabled={isDisabled}
        className={cn(
          "h-11 w-auto shrink-0 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90",
          isDisabled && "opacity-60",
          className
        )}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : primaryLabel}
      </Button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {boat.instantBook && (
        <Button
          type="button"
          onClick={() => handleClick("instant")}
          disabled={isDisabled}
          className={cn(
            "h-12 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary/90",
            isDisabled && "opacity-60"
          )}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Payment"}
        </Button>
      )}

      {boat.instantBook ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => handleClick("request")}
          disabled={isDisabled}
          className={cn(
            "h-11 w-full rounded-full text-sm font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground",
            isDisabled && "opacity-60"
          )}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send request instead"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => handleClick("request")}
          disabled={isDisabled}
          className={cn(
            "h-12 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary/90",
            isDisabled && "opacity-60"
          )}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Booking Request"}
        </Button>
      )}

      {user && (
        <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to our Terms of Service and Privacy Policy. Message & data rates
          may apply.
        </p>
      )}
    </div>
  );
}
