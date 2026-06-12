"use client";

import type { ReactNode } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { BookingSingleEditableField } from "@/features/bookings/booking-single-field-update";

export const BOOKING_FIELD_LABEL =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function BookingDetailEditableRow({
  field,
  label,
  display,
  editSlot,
  activeField,
  isPending,
  onEdit,
  onSave,
  onCancel,
  hideLabel = false,
}: {
  field: BookingSingleEditableField;
  label: string;
  display: ReactNode;
  editSlot: ReactNode;
  activeField: BookingSingleEditableField | null;
  isPending: boolean;
  onEdit: (field: BookingSingleEditableField) => void;
  onSave: () => void;
  onCancel: () => void;
  /** When true, label is screen-reader only (client card contact rows). */
  hideLabel?: boolean;
}) {
  const editing = activeField === field;
  const lockedOut = activeField !== null && !editing;

  return (
    <div className="space-y-1.5">
      <p
        className={
          hideLabel
            ? "sr-only"
            : `${BOOKING_FIELD_LABEL} font-medium`
        }
      >
        {label}
      </p>
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-sm leading-normal text-foreground">{display}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            disabled={lockedOut || isPending}
            aria-label={`Edit ${label}`}
            onClick={() => onEdit(field)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{editSlot}</div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" disabled={isPending} onClick={onSave}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
