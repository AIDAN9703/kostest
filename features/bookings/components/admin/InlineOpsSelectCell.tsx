"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import {
  OPS_AGENT_PRESETS,
  OPS_SELECT_CUSTOM,
  OPS_SELECT_NONE,
  OPS_SOURCE_OPTIONS,
  computeCommissionCentsFromRev,
  normalizeOpsSource,
} from "@/features/bookings/constants/ops-ui-config";
import { cn } from "@/shared/lib/utils/general-utils";

const NONE_SENTINEL = OPS_SELECT_NONE;
const CUSTOM_SENTINEL = OPS_SELECT_CUSTOM;

interface InlineOpsSelectCellProps {
  bookingId: string;
  variant: "source" | "agent";
  value: string | null | undefined;
  className?: string;
  /** Narrow controls for Admin → All table */
  compact?: boolean;
  applyCommissionOnSourceChange?: boolean;
  revenueCentsForCommission?: number | null;
}

export function InlineOpsSelectCell({
  bookingId,
  variant,
  value,
  className,
  compact = false,
  applyCommissionOnSourceChange,
  revenueCentsForCommission,
}: InlineOpsSelectCellProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const raw = (value ?? "").trim();
  const normalizedSource = variant === "source" ? normalizeOpsSource(raw) : raw;

  const persist = useCallback(
    async (input: Parameters<typeof updateBookingOps>[1]) => {
      setSaving(true);
      try {
        const result = await updateBookingOps(bookingId, input);
        if (result.success) router.refresh();
      } finally {
        setSaving(false);
      }
    },
    [bookingId, router]
  );

  const onSourceChange = useCallback(
    (v: string) => {
      const canonical = v === NONE_SENTINEL ? "" : normalizeOpsSource(v);
      void (async () => {
        if (
          applyCommissionOnSourceChange &&
          revenueCentsForCommission != null &&
          revenueCentsForCommission > 0
        ) {
          const split = computeCommissionCentsFromRev(
            revenueCentsForCommission,
            canonical
          );
          if (split) {
            await persist({
              sourceOverride: canonical || null,
              commissionAgentCents: split.agentCents,
              commissionKosCents: split.kosCents,
            });
            return;
          }
        }
        await persist({ sourceOverride: canonical || null });
      })();
    },
    [applyCommissionOnSourceChange, persist, revenueCentsForCommission]
  );

  // —— Source ——
  if (variant === "source") {
    const selectValue = normalizedSource || NONE_SENTINEL;
    const hasLegacyExtra =
      !!normalizedSource &&
      !OPS_SOURCE_OPTIONS.some((o) => o.toLowerCase() === normalizedSource.toLowerCase());

    return (
      <div className={className}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Select value={selectValue} onValueChange={onSourceChange}>
            <SelectTrigger
              className={cn(
                "text-xs",
                compact
                  ? "h-7 min-w-[4.5rem] max-w-[6.5rem] px-1.5"
                  : "h-8 min-w-[7rem] max-w-[10rem]"
              )}
            >
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_SENTINEL} className="text-xs">
                —
              </SelectItem>
              {OPS_SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs">
                  {opt}
                </SelectItem>
              ))}
              {hasLegacyExtra ? (
                <SelectItem value={normalizedSource} className="text-xs">
                  {normalizedSource} (legacy)
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  // —— Agent: free text when no presets ——
  if (OPS_AGENT_PRESETS.length === 0) {
    return (
      <AgentFreeTextCell
        raw={raw}
        persist={persist}
        saving={saving}
        className={className}
        compact={compact}
      />
    );
  }

  // —— Agent: presets + Other ——
  return (
    <AgentPresetCell
      raw={raw}
      persist={persist}
      saving={saving}
      className={className}
      compact={compact}
    />
  );
}

function AgentFreeTextCell({
  raw,
  persist,
  saving,
  className,
  compact,
}: {
  raw: string;
  persist: (input: Parameters<typeof updateBookingOps>[1]) => Promise<void>;
  saving: boolean;
  className?: string;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState(raw);
  useEffect(() => setDraft(raw), [raw]);

  return (
    <div className={className}>
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Input
          className={cn(
            "text-xs",
            compact ? "h-7 min-w-[4rem] max-w-[6rem] px-1.5" : "h-8 min-w-[6rem] max-w-[10rem]"
          )}
          placeholder="Agent"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void persist({ agentCode: draft.trim() || null })}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      )}
    </div>
  );
}

function AgentPresetCell({
  raw,
  persist,
  saving,
  className,
  compact,
}: {
  raw: string;
  persist: (input: Parameters<typeof updateBookingOps>[1]) => Promise<void>;
  saving: boolean;
  className?: string;
  compact?: boolean;
}) {
  const inPreset = OPS_AGENT_PRESETS.includes(raw);
  const baseSelect = !raw ? NONE_SENTINEL : inPreset ? raw : CUSTOM_SENTINEL;
  const [selectOverride, setSelectOverride] = useState<string | null>(null);
  useEffect(() => setSelectOverride(null), [raw]);

  const selectVal = selectOverride ?? baseSelect;

  const [customDraft, setCustomDraft] = useState(() =>
    baseSelect === CUSTOM_SENTINEL ? raw : ""
  );
  useEffect(() => {
    if (selectVal === CUSTOM_SENTINEL) {
      setCustomDraft(raw);
    }
  }, [raw, selectVal]);

  const onSelect = (v: string) => {
    setSelectOverride(v);
    if (v === NONE_SENTINEL) {
      void persist({ agentCode: null });
      return;
    }
    if (v === CUSTOM_SENTINEL) {
      setCustomDraft(raw && !OPS_AGENT_PRESETS.includes(raw) ? raw : "");
      return;
    }
    void persist({ agentCode: v });
  };

  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <Select value={selectVal} onValueChange={onSelect}>
            <SelectTrigger
              className={cn(
                "text-xs",
                compact
                  ? "h-7 min-w-[4.5rem] max-w-[6.5rem] px-1.5"
                  : "h-8 min-w-[7rem] max-w-[10rem]"
              )}
            >
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_SENTINEL} className="text-xs">
                —
              </SelectItem>
              {OPS_AGENT_PRESETS.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs">
                  {opt}
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_SENTINEL} className="text-xs">
                Other…
              </SelectItem>
            </SelectContent>
          </Select>
          {selectVal === CUSTOM_SENTINEL && (
            <Input
              className={cn("text-xs", compact ? "h-7 px-1.5" : "h-7")}
              placeholder="Custom agent"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onBlur={() => void persist({ agentCode: customDraft.trim() || null })}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
