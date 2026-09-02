"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Check, Loader2, Pencil, Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ProposalDialog, type ProposalDialogData } from "./ProposalDialog";

/**
 * Page-level edit mode for the booking detail page, plus the one proposal
 * dialog. "Update trip" flips the editable cards into forms; "Done updating"
 * runs every registered save and, if anything actually changed, opens the
 * dialog ("Notify customer of changes"). The Resend button under the header
 * opens the same dialog in plain-resend mode. One deal = one link.
 */
type EditSaver = () => Promise<{ ok: boolean; changed: boolean }>;

const Ctx = createContext<{
  editing: boolean;
  saving: boolean;
  setEditing: (editing: boolean) => void;
  registerSaver: (id: string, saver: EditSaver) => () => void;
  proposal: ProposalDialogData | null;
  openResend: () => void;
}>({
  editing: false,
  saving: false,
  setEditing: () => {},
  registerSaver: () => () => {},
  proposal: null,
  openResend: () => {},
});

export function BookingEditModeProvider({
  children,
  proposal = null,
}: {
  children: ReactNode;
  /** Null when there is nothing to send (no link yet, or deal settled). */
  proposal?: ProposalDialogData | null;
}) {
  const [editing, setEditingState] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState<"edited" | "resend">("resend");
  const saversRef = useRef(new Map<string, EditSaver>());

  const registerSaver = useCallback((id: string, saver: EditSaver) => {
    saversRef.current.set(id, saver);
    return () => {
      saversRef.current.delete(id);
    };
  }, []);

  const setEditing = (next: boolean) => {
    if (next || !editing) {
      setEditingState(next);
      return;
    }
    void (async () => {
      setSaving(true);
      try {
        let changed = false;
        for (const saver of saversRef.current.values()) {
          const r = await saver();
          if (!r.ok) return; // the card already toasted
          changed = changed || r.changed;
        }
        setEditingState(false);
        if (changed && proposal) {
          setReason("edited");
          setDialogOpen(true);
        }
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <Ctx.Provider
      value={{
        editing,
        saving,
        setEditing,
        registerSaver,
        proposal,
        openResend: () => {
          setReason("resend");
          setDialogOpen(true);
        },
      }}
    >
      {children}
      {proposal ? (
        <ProposalDialog data={proposal} reason={reason} open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : null}
    </Ctx.Provider>
  );
}

export function useBookingEditMode() {
  return useContext(Ctx);
}

export function BookingPageEditButton() {
  const { editing, saving, setEditing } = useBookingEditMode();
  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong"
      onClick={() => setEditing(!editing)}
      disabled={saving}
    >
      {editing ? (
        <>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Done updating"}
        </>
      ) : (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Update trip
        </>
      )}
    </Button>
  );
}

/** Full-width pill under the [Update trip][⋯] row — opens the proposal dialog. */
export function ProposalResendButton() {
  const { proposal, openResend } = useBookingEditMode();
  if (!proposal) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong"
      onClick={openResend}
    >
      <Send className="h-3.5 w-3.5" />
      {proposal.stage === "proposal" ? "Resend proposal" : "Resend payment"}
    </Button>
  );
}
