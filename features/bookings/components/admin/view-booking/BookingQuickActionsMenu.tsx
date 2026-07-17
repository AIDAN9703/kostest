"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Link2, Loader2, Send, XCircle, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { getOrCreateCheckoutUrlAction } from "@/features/bookings/actions/checkout-url.actions";
import {
  cancelBooking,
  markBookingCompleted,
} from "@/features/bookings/actions/admin-booking.actions";

interface BookingQuickActionsMenuProps {
  bookingId: string;
  bookingStatus: string;
  allowPaymentLink?: boolean;
  publicToken?: string | null;
}

/**
 * Header dropdown for booking actions — payment/proposal links plus the two
 * lifecycle transitions with no automatic trigger (complete, cancel).
 */
export function BookingQuickActionsMenu({
  bookingId,
  bookingStatus,
  allowPaymentLink = true,
  publicToken = null,
}: BookingQuickActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const isSettled = bookingStatus === "COMPLETED" || bookingStatus === "CANCELLED";

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

  const handleCopyProposalLink = async () => {
    if (!publicToken) return;
    const url = `${window.location.origin}/bookings/draft/${publicToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Proposal link copied",
        description: "Paste it anywhere — the customer can view, accept, and pay from it.",
      });
    } catch {
      toast({ title: "Couldn't copy automatically", description: url, variant: "destructive" });
    }
  };

  const handleMarkCompleted = () => {
    startTransition(async () => {
      const result = await markBookingCompleted(bookingId);
      if (result.success) {
        toast({ title: "Booking completed", description: "Charter marked as done." });
        router.refresh();
      } else {
        toast({
          title: "Couldn't complete booking",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelBooking(bookingId, cancelReason);
      if (result.success) {
        setShowCancelDialog(false);
        setCancelReason("");
        toast({ title: "Booking cancelled" });
        router.refresh();
      } else {
        toast({
          title: "Couldn't cancel booking",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const canComplete = bookingStatus === "CONFIRMED";
  const canPaymentLink = allowPaymentLink && !isSettled;
  const canProposalLink = Boolean(publicToken) && !isSettled;
  const canCancel = bookingStatus !== "CANCELLED";
  const hasAnything = canComplete || canPaymentLink || canProposalLink || canCancel;

  if (!hasAnything) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Quick actions
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {canComplete ? (
            <DropdownMenuItem onClick={handleMarkCompleted} className="cursor-pointer gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Mark charter completed
            </DropdownMenuItem>
          ) : null}
          {canPaymentLink ? (
            <DropdownMenuItem onClick={handlePaymentLink} className="cursor-pointer gap-2">
              <Send className="h-4 w-4" />
              Send / resend payment link
            </DropdownMenuItem>
          ) : null}
          {canProposalLink ? (
            <DropdownMenuItem onClick={handleCopyProposalLink} className="cursor-pointer gap-2">
              <Link2 className="h-4 w-4" />
              Copy proposal link
            </DropdownMenuItem>
          ) : null}
          {canCancel ? (
            <>
              {canComplete || canPaymentLink || canProposalLink ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Cancel booking
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCancelDialog} onOpenChange={(open) => !open && setShowCancelDialog(false)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              This closes the booking and frees the calendar. Refunds are handled separately on
              the payments card.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea
              placeholder="Why is this booking being cancelled?"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              className="mt-2 resize-none rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="rounded-xl"
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending || !cancelReason.trim()}
              className="rounded-xl gap-2"
            >
              {isPending ? "Cancelling…" : "Cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
