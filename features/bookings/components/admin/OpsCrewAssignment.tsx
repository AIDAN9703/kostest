"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
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
  addBookingCrewMember,
  removeBookingCrewMember,
} from "@/features/bookings/actions/admin-booking.actions";
import { useToast } from "@/shared/lib/hooks/use-toast";

export type CrewAssignmentMember = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string | null;
};

export type CrewAssignmentOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

function formatCrewName(c: { firstName: string | null; lastName: string | null; email: string }) {
  const n = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return n || c.email || "Unknown";
}

interface OpsCrewAssignmentProps {
  bookingId: string;
  assignedCrew: CrewAssignmentMember[];
  crewOptions: CrewAssignmentOption[];
}

export function OpsCrewAssignment({
  bookingId,
  assignedCrew,
  crewOptions,
}: OpsCrewAssignmentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const assignedUserIds = new Set(assignedCrew.map((c) => c.userId));
  const addable = crewOptions.filter((c) => !assignedUserIds.has(c.id));

  async function add(userId: string) {
    setPending(true);
    try {
      const res = await addBookingCrewMember(bookingId, userId, null);
      if (res.success) {
        setModalOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Could not add crew",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setPending(false);
    }
  }

  async function remove(bookingCrewId: string) {
    setPending(true);
    try {
      const res = await removeBookingCrewMember(bookingId, bookingCrewId);
      if (res.success) {
        router.refresh();
      } else {
        toast({
          title: "Could not remove crew",
          description: res.error ?? "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="inline-flex w-fit max-w-[13.5rem] flex-col gap-1">
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assigned crew
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
            disabled={pending}
            aria-label="Add crew member"
            onClick={() => setModalOpen(true)}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <ul className="min-w-0 space-y-1 text-xs leading-snug text-foreground">
          {assignedCrew.length === 0 ? (
            <li className="text-muted-foreground">None assigned</li>
          ) : (
            assignedCrew.map((m) => (
              <li key={m.id} className="flex min-w-0 items-center gap-0.5">
                <Link
                  href={`/admin/users/${m.userId}`}
                  className="min-w-0 flex-1 truncate font-medium underline-offset-4 hover:text-primary-strong hover:underline"
                  title={formatCrewName(m)}
                >
                  {formatCrewName(m)}
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 rounded-md text-muted-foreground hover:text-destructive"
                  disabled={pending}
                  aria-label={`Remove ${formatCrewName(m)}`}
                  onClick={() => remove(m.id)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!pending) setModalOpen(open);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add crew</DialogTitle>
            <DialogDescription>
              Assign additional crew for this charter. Only users with an active crew profile are
              listed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {addable.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start rounded-xl py-2 text-left font-normal"
                disabled={pending}
                onClick={() => add(c.id)}
              >
                <span className="block truncate font-medium">{formatCrewName(c)}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {c.email}
                </span>
              </Button>
            ))}
            {addable.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {crewOptions.length === 0
                  ? "No active crew yet. Create a user and enable their crew profile so they appear here."
                  : "Everyone listed is already assigned. Remove someone first or add more crew profiles."}
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
                Add crew (new user)
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Opens user creation in a new tab. Enable the crew profile, then refresh this page.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
