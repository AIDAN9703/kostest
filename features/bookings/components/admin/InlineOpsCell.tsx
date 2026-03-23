"use client";

import { useState, useCallback } from "react";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";

/** Field names as used by updateBookingOps (BookingOpsInput keys) */
export type OpsField =
  | "expenseCents"
  | "gmvCents"
  | "paidCents"
  | "balanceOwnerCents"
  | "balanceClientCents"
  | "crewName"
  | "opsNote"
  | "contractSigned"
  | "connected"
  | "clientPaid"
  | "captainPaid"
  | "allPaid"
  | "sheetsSent"
  | "agentCode"
  | "commissionAgentCents"
  | "commissionKosCents"
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
  /** Narrow inputs for dense tables (Admin → All). */
  compact?: boolean;
  className?: string;
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
  compact = false,
  className,
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
        className={cn(
          "cursor-pointer flex items-center justify-center",
          compact ? "min-w-[1.25rem]" : "min-w-[2rem]",
          className
        )}
        onClick={async () => {
          if (saving) return;
          await handleSave(!value);
        }}
      >
        {saving ? (
          <Loader2 className={cn("animate-spin text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
        ) : (
          <Checkbox
            checked={!!value}
            onCheckedChange={() => {}}
            className={cn("pointer-events-none", compact && "h-3.5 w-3.5")}
          />
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
        className={cn(
          "tabular-nums",
          compact
            ? "h-7 px-1.5 text-xs w-[4.25rem] max-w-[5rem]"
            : "h-8 text-sm min-w-[4rem]"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded border border-transparent hover:border-border cursor-text tabular-nums",
        compact
          ? "min-h-7 px-1.5 py-0.5 -mx-0.5 text-xs max-w-[5rem] w-[4.25rem] overflow-hidden text-ellipsis"
          : "min-h-8 px-2 py-1 -mx-2 -my-1 text-sm",
        className
      )}
      onClick={() => {
        setEditValue(
          isCents && typeof value === "number" ? (value / 100).toFixed(2) : String(value ?? "")
        );
        setEditing(true);
      }}
    >
      {saving ? (
        <Loader2 className={cn("animate-spin text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        displayValue
      )}
    </div>
  );
}
