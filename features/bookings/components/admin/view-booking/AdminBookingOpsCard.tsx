"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import type { BookingOpsData } from "@/features/bookings/services/booking-ops.service";
import { dollarsToCents, formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  computeOpsBalanceClientCents,
  computeOpsBalanceOwnerCents,
  computeOpsRevenueCents,
} from "@/shared/lib/utils/ops-revenue";
import {
  OPS_SELECT_NONE,
  OPS_SOURCE_OPTIONS,
  computeCommissionCentsFromRev,
  getCommissionSplitForSource,
  normalizeOpsSource,
} from "@/features/bookings/constants/ops-ui-config";
import { Loader2, RefreshCw, Save } from "lucide-react";

interface AdminBookingOpsCardProps {
  bookingId: string;
  totalAmountCents: number | null;
  ops: BookingOpsData | null;
}

function centsToDisplay(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function parseDollarsToCents(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(parsed)) return null;
  return dollarsToCents(parsed);
}

export function AdminBookingOpsCard({
  bookingId,
  totalAmountCents,
  ops,
}: AdminBookingOpsCardProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expenseCents, setExpenseCents] = useState(centsToDisplay(ops?.expenseCents));
  const [gmvCents, setGmvCents] = useState(centsToDisplay(ops?.gmvCents));
  const [paidCents, setPaidCents] = useState(centsToDisplay(ops?.paidCents));
  const [sentToOwnerCents, setSentToOwnerCents] = useState(
    centsToDisplay(ops?.sentToOwnerCents)
  );
  const [crewName, setCrewName] = useState(ops?.crewName ?? "");
  const [opsNote, setOpsNote] = useState(ops?.opsNote ?? "");
  const [contractSigned, setContractSigned] = useState(ops?.contractSigned ?? false);
  const [connected, setConnected] = useState(ops?.connected ?? false);
  const [clientPaid, setClientPaid] = useState(ops?.clientPaid ?? false);
  const [captainPaid, setCaptainPaid] = useState(ops?.captainPaid ?? false);
  const [allPaid, setAllPaid] = useState(ops?.allPaid ?? false);
  const [sheetsSent, setSheetsSent] = useState(ops?.sheetsSent ?? false);

  const [sourceOverride, setSourceOverride] = useState(
    normalizeOpsSource(ops?.sourceOverride ?? "")
  );
  const [commissionAgentCents, setCommissionAgentCents] = useState(
    centsToDisplay(ops?.commissionAgentCents)
  );
  const [commissionKosCents, setCommissionKosCents] = useState(
    centsToDisplay(ops?.commissionKosCents)
  );

  useEffect(() => {
    setSourceOverride(normalizeOpsSource(ops?.sourceOverride ?? ""));
  }, [ops?.sourceOverride]);

  useEffect(() => {
    setSentToOwnerCents(centsToDisplay(ops?.sentToOwnerCents));
  }, [ops?.sentToOwnerCents]);

  const revenuePreviewCents = useMemo(
    () => computeOpsRevenueCents(totalAmountCents, parseDollarsToCents(expenseCents)),
    [totalAmountCents, expenseCents]
  );

  const balanceClientPreviewCents = useMemo(
    () =>
      computeOpsBalanceClientCents(
        parseDollarsToCents(gmvCents),
        parseDollarsToCents(paidCents),
        totalAmountCents
      ),
    [gmvCents, paidCents, totalAmountCents]
  );

  const balanceOwnerPreviewCents = useMemo(
    () =>
      computeOpsBalanceOwnerCents(
        parseDollarsToCents(expenseCents),
        parseDollarsToCents(sentToOwnerCents)
      ),
    [expenseCents, sentToOwnerCents]
  );

  const splitHint = useMemo(() => getCommissionSplitForSource(sourceOverride), [sourceOverride]);

  const applyCommissionDefaults = () => {
    if (revenuePreviewCents == null || revenuePreviewCents <= 0 || !sourceOverride.trim()) return;
    const c = computeCommissionCentsFromRev(revenuePreviewCents, sourceOverride);
    if (!c) return;
    setCommissionAgentCents(centsToDisplay(c.agentCents));
    setCommissionKosCents(centsToDisplay(c.kosCents));
  };

  const onSourceSelectChange = (v: string) => {
    const canonical = v === OPS_SELECT_NONE ? "" : normalizeOpsSource(v);
    setSourceOverride(canonical);
    const rev = computeOpsRevenueCents(totalAmountCents, parseDollarsToCents(expenseCents));
    if (rev != null && rev > 0) {
      const c = computeCommissionCentsFromRev(rev, canonical);
      if (c) {
        setCommissionAgentCents(centsToDisplay(c.agentCents));
        setCommissionKosCents(centsToDisplay(c.kosCents));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await updateBookingOps(bookingId, {
        expenseCents: parseDollarsToCents(expenseCents),
        gmvCents: parseDollarsToCents(gmvCents),
        paidCents: parseDollarsToCents(paidCents),
        sentToOwnerCents: parseDollarsToCents(sentToOwnerCents),
        crewName: crewName.trim() || null,
        opsNote: opsNote.trim() || null,
        contractSigned,
        connected,
        clientPaid,
        captainPaid,
        allPaid,
        sheetsSent,
        agentCode: ops?.agentCode?.trim() || null,
        commissionAgentCents: parseDollarsToCents(commissionAgentCents),
        commissionKosCents: parseDollarsToCents(commissionKosCents),
        sourceOverride: sourceOverride.trim() || null,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Ops & Finance</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Source, money totals, commission, then payments and status flags.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl gap-2 shrink-0"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="max-w-md space-y-2">
            <Label htmlFor="ops-source" className="text-sm font-semibold">
              Source
            </Label>
            <Select value={sourceOverride || OPS_SELECT_NONE} onValueChange={onSourceSelectChange}>
              <SelectTrigger id="ops-source" className="rounded-xl h-11">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OPS_SELECT_NONE}>—</SelectItem>
                {OPS_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
                {sourceOverride &&
                !OPS_SOURCE_OPTIONS.some(
                  (o) => o.toLowerCase() === sourceOverride.toLowerCase()
                ) ? (
                  <SelectItem value={sourceOverride}>{sourceOverride} (legacy)</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-semibold tracking-tight text-foreground">Financial</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="expenseCents" className="text-sm font-semibold">
                  Expense
                </Label>
                <Input
                  id="expenseCents"
                  type="text"
                  placeholder="0.00"
                  value={expenseCents}
                  onChange={(e) => setExpenseCents(e.target.value)}
                  className="rounded-xl h-11 text-base tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmvCents" className="text-sm font-semibold">
                  GMV
                </Label>
                <Input
                  id="gmvCents"
                  type="text"
                  placeholder="0.00"
                  value={gmvCents}
                  onChange={(e) => setGmvCents(e.target.value)}
                  className="rounded-xl h-11 text-base tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue-readonly" className="text-sm font-semibold">
                  REV (total)
                </Label>
                <div
                  id="revenue-readonly"
                  className="flex h-11 items-center rounded-xl border border-input bg-background px-3 text-base font-medium tabular-nums text-foreground"
                  title="Booking total (pricing) minus expense — saved when you save ops."
                >
                  {revenuePreviewCents != null ? formatCentsAsCurrency(revenuePreviewCents) : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Commission split</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {splitHint
                    ? `Default for this source: ${splitHint.label}. Edit amounts as needed.`
                    : "Pick a source with a defined split, or enter commissions manually."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 shrink-0"
                onClick={applyCommissionDefaults}
                disabled={
                  revenuePreviewCents == null || revenuePreviewCents <= 0 || !sourceOverride.trim()
                }
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Apply defaults
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commissionAgentCents" className="text-sm font-semibold">
                  Commission Agent
                </Label>
                <Input
                  id="commissionAgentCents"
                  type="text"
                  placeholder="0.00"
                  value={commissionAgentCents}
                  onChange={(e) => setCommissionAgentCents(e.target.value)}
                  className="rounded-xl h-11 text-base tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionKosCents" className="text-sm font-semibold">
                  Commission KOS
                </Label>
                <Input
                  id="commissionKosCents"
                  type="text"
                  placeholder="0.00"
                  value={commissionKosCents}
                  onChange={(e) => setCommissionKosCents(e.target.value)}
                  className="rounded-xl h-11 text-base tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Payments &amp; balances</h4>
            <p className="text-xs text-muted-foreground">
              Balance owner is expense minus sent to owner; balance client is GMV (or quote total)
              minus PAID — both update when you save.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="paidCents">PAID</Label>
                <Input
                  id="paidCents"
                  type="text"
                  placeholder="0.00"
                  value={paidCents}
                  onChange={(e) => setPaidCents(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sentToOwnerCents">Sent owner</Label>
                <Input
                  id="sentToOwnerCents"
                  type="text"
                  placeholder="0.00"
                  value={sentToOwnerCents}
                  onChange={(e) => setSentToOwnerCents(e.target.value)}
                  className="rounded-xl tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label>Balance Owner</Label>
                <div
                  className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm tabular-nums text-foreground"
                  title="Expense − sent to owner (saved when you save)"
                >
                  {formatCentsAsCurrency(balanceOwnerPreviewCents)}
                </div>
                <p className="text-xs text-muted-foreground">Expense − sent owner</p>
              </div>
              <div className="space-y-2">
                <Label>Balance Client</Label>
                <div
                  className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm tabular-nums text-foreground"
                  title="GMV − PAID (saved automatically when you save)"
                >
                  {formatCentsAsCurrency(balanceClientPreviewCents)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ops GMV − PAID, or quote total − PAID if GMV is empty
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="crewName">Crew / Captain</Label>
              <Input
                id="crewName"
                placeholder="e.g. Jackie, Max"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opsNote">Note</Label>
              <Input
                id="opsNote"
                placeholder="Ops note..."
                value={opsNote}
                onChange={(e) => setOpsNote(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground">Status flags</p>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                {
                  id: "contractSigned",
                  label: "Contract signed",
                  checked: contractSigned,
                  set: setContractSigned,
                },
                { id: "connected", label: "Connected?", checked: connected, set: setConnected },
                {
                  id: "clientPaid",
                  label: "C Paid? (Client)",
                  checked: clientPaid,
                  set: setClientPaid,
                },
                {
                  id: "captainPaid",
                  label: "Capt Paid?",
                  checked: captainPaid,
                  set: setCaptainPaid,
                },
                { id: "allPaid", label: "All Paid?", checked: allPaid, set: setAllPaid },
                { id: "sheetsSent", label: "Sheets?", checked: sheetsSent, set: setSheetsSent },
              ].map(({ id, label, checked, set }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox id={id} checked={checked} onCheckedChange={(v) => set(v === true)} />
                  <Label htmlFor={id} className="text-sm font-medium leading-none cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
