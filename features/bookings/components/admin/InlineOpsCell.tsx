"use client";

import { useState, useCallback } from "react";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Field names as used by updateBookingOps (BookingOpsInput keys) */
export type OpsField =
  | "expenseCents"
  | "revenueCents"
  | "balanceOwnerCents"
  | "crewName"
  | "contractSigned"
  | "captainPaid"
  | "commissionCents"
  | "sourceOverride";

interface InlineOpsCellProps {
  bookingId: string;
  field: OpsField;
  value: string | number | boolean | null | undefined;
  /** For cents fields, display as currency */
  isCents?: boolean;
  /** For checkbox fields */
  isCheckbox?: boolean;
  placeholder?: string;
}

function parseCents(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

export function InlineOpsCell({
  bookingId,
  field,
  value,
  isCents,
  isCheckbox,
  placeholder = "—",
}: InlineOpsCellProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValue, setEditValue] = useState(
    isCents && typeof value === "number"
      ? (value / 100).toFixed(2)
      : String(value ?? "")
  );

  const displayValue =
    isCents && typeof value === "number"
      ? formatCentsAsCurrency(value)
      : isCheckbox
        ? value
          ? "✓"
          : ""
        : value != null && value !== ""
          ? String(value)
          : placeholder;

  const handleSave = useCallback(
    async (newValue: string | number | boolean) => {
      setSaving(true);
      try {
        const input: Record<string, unknown> = {};
        if (isCents) {
          input[field] = parseCents(String(newValue));
        } else if (isCheckbox) {
          input[field] = Boolean(newValue);
        } else {
          input[field] = typeof newValue === "string" && !newValue.trim() ? null : newValue;
        }
        const result = await updateBookingOps(bookingId, input as Parameters<typeof updateBookingOps>[1]);
        if (result.success) {
          router.refresh();
          setEditing(false);
        }
      } finally {
        setSaving(false);
      }
    },
    [bookingId, field, isCents, isCheckbox, router]
  );

  const handleBlur = useCallback(() => {
    if (!isCheckbox) {
      if (isCents) {
        handleSave(editValue);
      } else {
        handleSave(editValue);
      }
    }
  }, [editValue, handleSave, isCents, isCheckbox]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  if (isCheckbox) {
    return (
      <div
        className="min-w-[2rem] cursor-pointer"
        onClick={async () => {
          if (saving) return;
          await handleSave(!value);
        }}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Checkbox checked={!!value} onCheckedChange={() => {}} className="pointer-events-none" />
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className="h-8 text-sm min-w-[4rem]"
      />
    );
  }

  return (
    <div
      className="min-h-8 px-2 py-1 -mx-2 -my-1 rounded border border-transparent hover:border-border cursor-text text-sm"
      onClick={() => {
        setEditValue(
          isCents && typeof value === "number" ? (value / 100).toFixed(2) : String(value ?? "")
        );
        setEditing(true);
      }}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        displayValue
      )}
    </div>
  );
}
