"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, PauseCircle, CalendarPlus } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { updateInquiryOutcome } from "@/features/inquiries/inquiry.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";

const LOST_REASONS = [
  "Customer declined",
  "Chose competitor",
  "Budget mismatch",
  "Timing didn't work",
  "Other",
] as const;

function formatLabel(s: string) {
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface InquiryCloseActionsProps {
  inquiryId: string;
  currentOutcome: string;
}

export function InquiryCloseActions({
  inquiryId,
  currentOutcome,
}: InquiryCloseActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [lostReason, setLostReason] = useState("");
  const [lostReasonOther, setLostReasonOther] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [showCloseDialog, setShowCloseDialog] = useState<
    "won" | "lost" | "abandoned" | null
  >(null);

  const isClosed = currentOutcome !== "OPEN";

  if (isClosed) {
    return null; // Don't show close actions if already closed
  }

  async function handleCloseInquiry(
    outcome: "WON" | "LOST" | "ABANDONED",
    createBooking: boolean = false,
  ) {
    setLoading(outcome.toLowerCase());
    const reason =
      outcome === "LOST"
        ? lostReason === "Other"
          ? lostReasonOther
          : lostReason
        : undefined;

    const res = await updateInquiryOutcome(inquiryId, outcome, reason);
    setLoading(null);
    if (res.success) {
      setShowCloseDialog(null);
      setLostReason("");
      setLostReasonOther("");

      router.refresh();
      toast({
        title: `Inquiry marked as ${formatLabel(outcome)} ✓`,
        description:
          outcome === "WON"
            ? createBooking
              ? "Redirecting to create booking. The inquiry will be marked CONVERTED when the booking is saved."
              : "Inquiry marked as won. Create a booking to mark as CONVERTED."
            : "Inquiry has been closed",
      });

      // If WON and creating booking, redirect to booking creation (don't convert yet - conversion happens when booking is saved)
      if (outcome === "WON" && createBooking) {
        router.push(`/admin/bookings/create?inquiryId=${inquiryId}`);
      }
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  return (
    <>
      {/* Close Inquiry Section */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-sm font-medium mb-3">Close Inquiry</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setShowCloseDialog("won")}
            disabled={loading !== null}
            className="rounded-xl gap-2 bg-green-600 text-white hover:bg-green-700 shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Won
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCloseDialog("lost")}
            disabled={loading !== null}
            className="rounded-xl gap-2"
          >
            <XCircle className="h-4 w-4" />
            Mark as Lost
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCloseDialog("abandoned")}
            disabled={loading !== null}
            className="rounded-xl gap-2 bg-slate-600 text-white hover:bg-slate-700 shadow-sm"
          >
            <PauseCircle className="h-4 w-4" />
            Mark as Abandoned
          </Button>
        </div>
      </div>

      {/* Mark as Won Dialog */}
      <Dialog
        open={showCloseDialog === "won"}
        onOpenChange={(open) => !open && setShowCloseDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Mark as Won</DialogTitle>
            <DialogDescription>
              This will mark the inquiry as won. Would you like to create a
              booking? The inquiry will be linked to the booking and marked as
              CONVERTED when you save the booking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(null)}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCloseInquiry("WON", false)}
              disabled={loading === "won"}
              variant="outline"
              className="w-full sm:w-auto rounded-xl"
            >
              {loading === "won" ? "Marking..." : "Mark as Won Only"}
            </Button>
            <Button
              onClick={() => handleCloseInquiry("WON", true)}
              disabled={loading === "won"}
              className="w-full sm:w-auto rounded-xl gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              {loading === "won" ? (
                "Marking..."
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4" />
                  Mark as Won & Create Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Lost Dialog */}
      <Dialog
        open={showCloseDialog === "lost"}
        onOpenChange={(open) => !open && setShowCloseDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Mark as Lost</DialogTitle>
            <DialogDescription>
              This will close the inquiry and mark it as lost. Please provide a
              reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Select value={lostReason} onValueChange={setLostReason}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {LOST_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {lostReason === "Other" && (
              <div>
                <Label>Please specify</Label>
                <Textarea
                  placeholder="Reason details..."
                  value={lostReasonOther}
                  onChange={(e) => setLostReasonOther(e.target.value)}
                  rows={2}
                  className="mt-2 rounded-xl resize-none"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCloseDialog(null);
                setLostReason("");
                setLostReasonOther("");
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCloseInquiry("LOST")}
              disabled={loading === "lost" || !lostReason}
              variant="destructive"
              className="rounded-xl gap-2"
            >
              {loading === "lost" ? "Marking..." : "Mark as Lost"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Abandoned Dialog */}
      <Dialog
        open={showCloseDialog === "abandoned"}
        onOpenChange={(open) => !open && setShowCloseDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Mark as Abandoned</DialogTitle>
            <DialogDescription>
              This will close the inquiry and mark it as abandoned. Use this
              when the customer hasn't responded after multiple attempts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCloseInquiry("ABANDONED")}
              disabled={loading === "abandoned"}
              variant="outline"
              className="rounded-xl gap-2"
            >
              {loading === "abandoned" ? "Marking..." : "Mark as Abandoned"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
