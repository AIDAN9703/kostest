"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  ChevronRight,
  Copy,
  FileText,
  Loader2,
  Mail,
  Send,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import { getOrCreateCheckoutUrlAction } from "@/features/bookings/actions/checkout-url.actions";

interface AdminBookingQuickActionsCardProps {
  bookingId: string;
  /**
   * When false, the "Send / resend payment link" action is hidden because
   * there is nothing left to collect (e.g. fully refunded or zero-priced).
   */
  allowPaymentLink?: boolean;
}

/**
 * Sidebar quick-actions card. Two categories of action:
 *
 * - **Wired**: actions that map to an existing server action and run for real
 *   (`payment-link`, `refund`).
 * - **Coming soon**: affordances that are valuable to surface for muscle
 *   memory but don't have a backing implementation yet (`pre-trip`, `review`,
 *   `duplicate`). They show a polite toast instead of silently failing.
 *
 * The "Issue refund" action scrolls to and highlights the Payment card,
 * because refund UI already exists there as part of the payment ledger flow —
 * no point duplicating the dialog.
 */
export function AdminBookingQuickActionsCard({
  bookingId,
  allowPaymentLink = true,
}: AdminBookingQuickActionsCardProps) {
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePaymentLink = () => {
    setPendingId("payment-link");
    startTransition(async () => {
      const result = await getOrCreateCheckoutUrlAction(bookingId);
      setPendingId(null);
      if (!result.success) {
        toast({
          title: "Couldn't create payment link",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
      toast({
        title: "Payment link opened",
        description: "Copy the URL from the new tab to send to the customer.",
      });
    });
  };

  const handleScrollToPayment = () => {
    const node = document.getElementById("ops");
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    toast({
      title: "Refunds happen on the Payment card",
      description:
        "Scroll to the Payment section and use the Make payment / refund controls there.",
    });
  };

  const handleComingSoon = (label: string) => () => {
    toast({
      title: `${label} — coming soon`,
      description: "This action isn't wired up yet. Tell Aidan if you need it next.",
    });
  };

  const actions: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
    placeholder?: boolean;
  }> = [
    {
      id: "payment-link",
      label: "Send / resend payment link",
      icon: Send,
      onClick: handlePaymentLink,
      hidden: !allowPaymentLink,
    },
    {
      id: "refund",
      label: "Issue refund",
      icon: Undo2,
      onClick: handleScrollToPayment,
    },
    {
      id: "pre-trip",
      label: "Send pre-trip info pack",
      icon: Mail,
      onClick: handleComingSoon("Pre-trip info pack"),
      placeholder: true,
    },
    {
      id: "review",
      label: "Trigger review request",
      icon: FileText,
      onClick: handleComingSoon("Review request"),
      placeholder: true,
    },
    {
      id: "calendar",
      label: "Add to calendar",
      icon: Calendar,
      onClick: handleComingSoon("Calendar sync"),
      placeholder: true,
    },
    {
      id: "duplicate",
      label: "Duplicate booking",
      icon: Copy,
      onClick: handleComingSoon("Duplicate booking"),
      placeholder: true,
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {actions
          .filter((a) => !a.hidden)
          .map((action) => {
            const Icon = action.icon;
            const showSpinner = pendingId === action.id && isPending;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled || isPending}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60",
                  action.placeholder
                    ? "text-muted-foreground"
                    : "text-foreground",
                  isPending && pendingId !== action.id && "opacity-60"
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {showSpinner ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{action.label}</span>
                  {action.placeholder ? (
                    <span className="ml-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
      </CardContent>
    </Card>
  );
}
