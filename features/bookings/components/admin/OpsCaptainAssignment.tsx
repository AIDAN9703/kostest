"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { assignCaptainToBooking } from "@/features/bookings/actions/admin-booking.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";

export type CaptainAssignmentOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

function formatCaptainName(c: CaptainAssignmentOption): string {
  const n = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return n || c.email || "Unknown";
}

function displayAssigned(
  captainUserId: string | null,
  captainFirstName: string | null,
  captainLastName: string | null,
  captainEmail: string | null,
  captainOptions: CaptainAssignmentOption[]
): CaptainAssignmentOption | null {
  if (!captainUserId) return null;
  const fromList = captainOptions.find((c) => c.id === captainUserId);
  if (fromList) return fromList;
  return {
    id: captainUserId,
    firstName: captainFirstName,
    lastName: captainLastName,
    email: captainEmail ?? "",
  };
}

const tableAssignButtonClass =
  "inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground";

interface OpsCaptainAssignmentProps {
  bookingId: string;
  captainUserId: string | null;
  captainFirstName: string | null;
  captainLastName: string | null;
  captainEmail: string | null;
  captainOptions: CaptainAssignmentOption[];
  /** Bookings table: dashed Captain button / clickable name only */
  compact?: boolean;
}

export function OpsCaptainAssignment({
  bookingId,
  captainUserId,
  captainFirstName,
  captainLastName,
  captainEmail,
  captainOptions,
  compact = false,
}: OpsCaptainAssignmentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const assigned = displayAssigned(
    captainUserId,
    captainFirstName,
    captainLastName,
    captainEmail,
    captainOptions
  );

  async function apply(next: string | null) {
    setPending(true);
    try {
      const res = await assignCaptainToBooking(bookingId, next);
      if (res.success) {
        setModalOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Could not update captain",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setPending(false);
    }
  }

  const assignDialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={(open) => {
        if (!pending) setModalOpen(open);
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign captain</DialogTitle>
          <DialogDescription>
            Choose who is running this charter. Only users with an active captain profile are
            listed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {captainUserId ? (
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-start rounded-xl py-2 text-left font-normal"
              disabled={pending}
              onClick={() => apply(null)}
            >
              Clear assignment (unassigned)
            </Button>
          ) : null}
          {captainOptions.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={captainUserId === c.id ? "secondary" : "outline"}
              className="h-auto w-full justify-start rounded-xl py-2 text-left font-normal"
              disabled={pending}
              onClick={() => apply(c.id)}
            >
              <span className="block truncate font-medium">{formatCaptainName(c)}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {c.email}
              </span>
            </Button>
          ))}
          {captainOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active captains yet. Use the button below to create a user, then set up their
              captain profile so they appear here.
            </p>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 rounded-xl"
            disabled={pending}
            asChild
          >
            <Link href="/admin/users/create" target="_blank" rel="noopener noreferrer">
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              Add captain (new user)
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Opens user creation in a new tab. After they have an active captain profile, refresh
            this page to assign them.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (compact) {
    return (
      <>
        <div onClick={(e) => e.stopPropagation()}>
          {assigned ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setModalOpen(true)}
              className="max-w-full truncate text-left text-sm font-medium text-foreground transition-colors hover:text-primary-strong"
              title={formatCaptainName(assigned)}
            >
              {formatCaptainName(assigned)}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setModalOpen(true)}
              className={tableAssignButtonClass}
              title="Assign captain"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-3 w-3" aria-hidden />
              )}
              Captain
            </button>
          )}
        </div>
        {assignDialog}
      </>
    );
  }

  return (
    <>
      <div className="inline-flex w-fit max-w-[13.5rem] flex-col gap-1">
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Captain
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
            disabled={pending}
            aria-label="Assign or change captain"
            onClick={() => setModalOpen(true)}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden />
            )}
          </Button>
        </div>
        <div className="min-w-0 truncate text-xs leading-snug text-foreground">
          {assigned ? (
            <Link
              href={`/admin/users/${assigned.id}`}
              className="font-medium underline-offset-4 hover:text-primary-strong hover:underline"
              title={formatCaptainName(assigned)}
            >
              {formatCaptainName(assigned)}
            </Link>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      </div>

      {assignDialog}
    </>
  );
}
