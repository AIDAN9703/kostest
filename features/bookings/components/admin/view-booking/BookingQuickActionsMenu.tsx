"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  FileText,
  Link2,
  Loader2,
  Phone,
  Send,
  Snowflake,
  UserCheck,
  XCircle,
  Zap,
  Archive,
} from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { getOrCreateCheckoutUrlAction } from "@/features/bookings/actions/checkout-url.actions";
import {
  assignAdminToBooking,
  cancelBooking,
  markBookingCompleted,
} from "@/features/bookings/actions/admin-booking.actions";
import {
  addDealNote,
  logDealContact,
  markDealLost,
  toggleDealArchived,
  toggleDealCold,
} from "@/features/bookings/actions/deal.actions";

const CONTACT_METHODS = [
  { value: "PHONE", label: "Phone" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "IN_PERSON", label: "In person" },
  { value: "OTHER", label: "Other" },
] as const;

export interface DealAdminOption {
  id: string;
  name: string;
}

interface BookingQuickActionsMenuProps {
  bookingId: string;
  bookingStatus: string;
  allowPaymentLink?: boolean;
  publicToken?: string | null;
  isCold?: boolean;
  isArchived?: boolean;
  assignedAdminId?: string | null;
  admins?: DealAdminOption[];
  /** Current admin's user id — powers "Assign to me". */
  currentUserId?: string | null;
}

type DialogKind = "contact" | "note" | "lost" | "cancel" | null;

/**
 * The deal action center — every verb an agent needs, one dropdown.
 * Lead-phase verbs (contact, note, cold, lost, proposal) and booking-phase
 * verbs (payment link, complete, cancel) show based on where the deal is.
 */
export function BookingQuickActionsMenu({
  bookingId,
  bookingStatus,
  allowPaymentLink = true,
  publicToken = null,
  isCold = false,
  isArchived = false,
  assignedAdminId = null,
  admins = [],
  currentUserId = null,
}: BookingQuickActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [contactMethod, setContactMethod] = useState<(typeof CONTACT_METHODS)[number]["value"]>("PHONE");
  const [dialogText, setDialogText] = useState("");

  const isInquiry = bookingStatus === "INQUIRY";
  const isSettled = bookingStatus === "COMPLETED" || bookingStatus === "CANCELLED";

  function run(action: () => Promise<{ success: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        setOpenDialog(null);
        setDialogText("");
        if (result.message) toast({ title: result.message });
        router.refresh();
      } else {
        toast({ title: "Action failed", description: result.error, variant: "destructive" });
      }
    });
  }

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Quick actions
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* The winning path first */}
          {isInquiry ? (
            <>
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link href={`/admin/bookings/create?dealId=${bookingId}`}>
                  <CalendarPlus className="h-4 w-4" />
                  Create proposal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {/* Work-the-deal verbs — useful at any live stage */}
          {!isSettled ? (
            <>
              <DropdownMenuItem
                onClick={() => setOpenDialog("contact")}
                className="cursor-pointer gap-2"
              >
                <Phone className="h-4 w-4" />
                Log contact
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenDialog("note")}
                className="cursor-pointer gap-2"
              >
                <FileText className="h-4 w-4" />
                Add note
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assign
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {currentUserId && assignedAdminId !== currentUserId ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => run(() => assignAdminToBooking(bookingId, currentUserId))}
                        className="cursor-pointer"
                      >
                        Assign to me
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}
                  {admins.length === 0 ? (
                    <DropdownMenuItem disabled>No admins available</DropdownMenuItem>
                  ) : (
                    admins.map((admin) => (
                      <DropdownMenuItem
                        key={admin.id}
                        disabled={admin.id === assignedAdminId}
                        onClick={() => run(() => assignAdminToBooking(bookingId, admin.id))}
                        className="cursor-pointer"
                      >
                        {admin.name}
                        {admin.id === assignedAdminId ? (
                          <CheckCircle2 className="ml-auto h-4 w-4 text-success" />
                        ) : null}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {/* Booking-phase money/lifecycle */}
          {bookingStatus === "CONFIRMED" ? (
            <DropdownMenuItem
              onClick={() => run(() => markBookingCompleted(bookingId))}
              className="cursor-pointer gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark charter completed
            </DropdownMenuItem>
          ) : null}
          {!isInquiry && !isSettled && allowPaymentLink ? (
            <DropdownMenuItem onClick={handlePaymentLink} className="cursor-pointer gap-2">
              <Send className="h-4 w-4" />
              Send / resend payment link
            </DropdownMenuItem>
          ) : null}
          {!isInquiry && !isSettled && publicToken ? (
            <DropdownMenuItem onClick={handleCopyProposalLink} className="cursor-pointer gap-2">
              <Link2 className="h-4 w-4" />
              Copy proposal link
            </DropdownMenuItem>
          ) : null}

          {/* Quiet ways out */}
          <DropdownMenuSeparator />
          {isInquiry ? (
            <DropdownMenuItem
              onClick={() => run(() => toggleDealCold(bookingId))}
              className="cursor-pointer gap-2"
            >
              <Snowflake className="h-4 w-4" />
              {isCold ? "Revive from cold" : "Mark cold"}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => run(() => toggleDealArchived(bookingId))}
            className="cursor-pointer gap-2"
          >
            <Archive className="h-4 w-4" />
            {isArchived ? "Restore from archive" : "Archive"}
          </DropdownMenuItem>
          {isInquiry ? (
            <DropdownMenuItem
              onClick={() => setOpenDialog("lost")}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <XCircle className="h-4 w-4" />
              Mark lost
            </DropdownMenuItem>
          ) : bookingStatus !== "CANCELLED" ? (
            <DropdownMenuItem
              onClick={() => setOpenDialog("cancel")}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <XCircle className="h-4 w-4" />
              Cancel booking
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Log contact */}
      <Dialog open={openDialog === "contact"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Log contact</DialogTitle>
            <DialogDescription>
              The first logged contact moves the deal to Contacted on the pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Method</Label>
              <Select
                value={contactMethod}
                onValueChange={(v) => setContactMethod(v as typeof contactMethod)}
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={dialogText}
                onChange={(e) => setDialogText(e.target.value)}
                placeholder="What was discussed?"
                rows={2}
                className="mt-2 resize-none rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => run(() => logDealContact(bookingId, contactMethod, dialogText))}
              disabled={isPending}
              className="rounded-xl"
            >
              {isPending ? "Logging…" : "Log contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add note */}
      <Dialog open={openDialog === "note"} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <Textarea
            value={dialogText}
            onChange={(e) => setDialogText(e.target.value)}
            placeholder="Internal note — visible to staff only"
            rows={3}
            className="resize-none rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => run(() => addDealNote(bookingId, dialogText))}
              disabled={isPending || !dialogText.trim()}
              className="rounded-xl"
            >
              {isPending ? "Saving…" : "Add note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark lost / cancel — same dialog shape, different verb */}
      <Dialog
        open={openDialog === "lost" || openDialog === "cancel"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{openDialog === "lost" ? "Mark deal lost" : "Cancel booking"}</DialogTitle>
            <DialogDescription>
              {openDialog === "lost"
                ? "Closes the deal as lost — it moves to the archive bucket."
                : "Closes the booking and frees the calendar. Refunds are handled on the payments card."}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea
              value={dialogText}
              onChange={(e) => setDialogText(e.target.value)}
              placeholder={openDialog === "lost" ? "Why was it lost?" : "Why is it cancelled?"}
              rows={2}
              className="mt-2 resize-none rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} className="rounded-xl">
              Keep deal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                run(() =>
                  openDialog === "lost"
                    ? markDealLost(bookingId, dialogText)
                    : cancelBooking(bookingId, dialogText)
                )
              }
              disabled={isPending || !dialogText.trim()}
              className="rounded-xl gap-2"
            >
              {isPending ? "Working…" : openDialog === "lost" ? "Mark lost" : "Cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
