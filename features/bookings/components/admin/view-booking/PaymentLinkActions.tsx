"use client";

import { useTransition } from "react";
import { Link2, Loader2, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { getOrCreateCheckoutUrlAction } from "@/features/bookings/actions/checkout-url.actions";
import { shareProposalLink } from "@/features/bookings/actions/deal.actions";

interface PaymentLinkActionsProps {
  bookingId: string;
  /** Show the Stripe payment-link button (there's still money to collect). */
  showPaymentLink: boolean;
  /** Public draft token — enables the proposal-link button. Pass null to hide. */
  publicToken: string | null;
}

// Header-pill style: soft fill, no border, gold text — same as Edit page.
const PILL =
  "shrink-0 gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong";

/**
 * The customer-facing money links, living on the money card (extracted from
 * the old quick-actions dropdown).
 */
export function PaymentLinkActions({
  bookingId,
  showPaymentLink,
  publicToken,
}: PaymentLinkActionsProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handlePaymentLink = () => {
    startTransition(async () => {
      const result = await getOrCreateCheckoutUrlAction(bookingId);
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

  const handleCopyProposalLink = () => {
    if (!publicToken) return;
    const url = `${window.location.origin}/bookings/draft/${publicToken}`;
    startTransition(async () => {
      // Copying = publishing: activate the link server-side so the public page
      // accepts the token (unsent drafts are private until shared).
      const shared = await shareProposalLink(bookingId);
      if (!shared.success) {
        toast({
          title: "Couldn't activate the link",
          description: shared.error,
          variant: "destructive",
        });
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Proposal link copied",
          description: "Paste it anywhere — the customer can view, accept, and pay from it.",
        });
      } catch {
        toast({ title: "Couldn't copy automatically", description: url, variant: "destructive" });
      }
    });
  };

  if (!showPaymentLink && !publicToken) return null;

  return (
    <>
      {publicToken ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={PILL}
          disabled={isPending}
          onClick={handleCopyProposalLink}
        >
          <Link2 className="h-3.5 w-3.5" />
          Copy proposal link
        </Button>
      ) : null}
      {showPaymentLink ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={PILL}
          disabled={isPending}
          onClick={handlePaymentLink}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Payment link
        </Button>
      ) : null}
    </>
  );
}
