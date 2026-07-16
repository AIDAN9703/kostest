"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, PauseCircle } from "lucide-react";
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

  async function handleCloseInquiry(outcome: "WON" | "LOST" | "ABANDONED") {
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
        description: outcome === "WON" ? "Inquiry marked as won." : "Inquiry has been closed",
      });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  }

  /**
   * Redirect to the admin booking form with inquiry prefill. The inquiry is
   * marked WON/CONVERTED by the booking service when the booking is actually
   * created — never before, so abandoning the form leaves the lead open.
   */
  function handleCreateBooking() {
    setShowCloseDialog(null);
    router.push(`/admin/bookings/create?inquiryId=${inquiryId}`);
  }

  return (
    <>
      {/* Close Inquiry Section */}
      <section>
        <h2 className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-6 bg-foreground/50" aria-hidden />
          Close out
        </h2>
        <div className="flex flex-col gap-2 pt-3">
          <Button
            size="sm"
            onClick={() => setShowCloseDialog("won")}
            disabled={loading !== null}
            className="justify-start gap-2 rounded-lg bg-green-600 text-white shadow-sm hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Create a Booking
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloseDialog("lost")}
              disabled={loading !== null}
              className="flex-1 justify-start gap-2 rounded-lg text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
            >
              <XCircle className="h-4 w-4" />
              Lost
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloseDialog("abandoned")}
              disabled={loading !== null}
              className="flex-1 justify-start gap-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <PauseCircle className="h-4 w-4" />
              Archive
            </Button>
          </div>
        </div>
      </section>

      {/* Create booking (marks inquiry as won, then pre-filled booking form) */}
      <Dialog
        open={showCloseDialog === "won"}
        onOpenChange={(open) => !open && setShowCloseDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create a booking</DialogTitle>
            <DialogDescription>
              Opens the booking form with contact info, guest count, and charter
              notes prefilled from the inquiry when available. You choose the boat
              and finish pricing there — the inquiry is marked as won once the
              booking is created.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setShowCloseDialog(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              className="rounded-xl gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              Continue
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
              variant="destructive"
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
              variant="destructive"
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
