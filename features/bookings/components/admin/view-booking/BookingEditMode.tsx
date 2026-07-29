"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

/**
 * Page-level edit mode for the booking detail page. One "Edit page" button
 * in the header flips every editable card into a form with its own Save —
 * no per-field pencil buttons scattered through the page.
 */
const BookingEditModeContext = createContext<{
  editing: boolean;
  setEditing: (editing: boolean) => void;
}>({ editing: false, setEditing: () => {} });

export function BookingEditModeProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState(false);
  return (
    <BookingEditModeContext.Provider value={{ editing, setEditing }}>
      {children}
    </BookingEditModeContext.Provider>
  );
}

export function useBookingEditMode() {
  return useContext(BookingEditModeContext);
}

export function BookingPageEditButton() {
  const { editing, setEditing } = useBookingEditMode();
  return (
    <Button
      variant="outline"
      size="sm"
      // Toolbar pill: visible gray fill (bg-muted blends into the card), gold text.
      className="shrink-0 gap-1.5 rounded-full border-0 bg-foreground/10 px-4 text-primary-strong hover:bg-foreground/15 hover:text-primary-strong"
      onClick={() => setEditing(!editing)}
    >
      {editing ? (
        <>
          <X className="h-3.5 w-3.5" />
          Done editing
        </>
      ) : (
        <>
          <Pencil className="h-3.5 w-3.5" />
          Edit page
        </>
      )}
    </Button>
  );
}
