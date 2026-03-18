"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import type { BookingOpsData } from "@/features/bookings/services/booking-ops.service";
import { dollarsToCents } from "@/shared/lib/utils/money-utils";
import { Loader2, Save } from "lucide-react";

interface AdminBookingOpsCardProps {
  bookingId: string;
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

export function AdminBookingOpsCard({ bookingId, ops }: AdminBookingOpsCardProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expenseCents, setExpenseCents] = useState(centsToDisplay(ops?.expenseCents));
  const [gmvCents, setGmvCents] = useState(centsToDisplay(ops?.gmvCents));
  const [revenueCents, setRevenueCents] = useState(centsToDisplay(ops?.revenueCents));
  const [paidCents, setPaidCents] = useState(centsToDisplay(ops?.paidCents));
  const [balanceOwnerCents, setBalanceOwnerCents] = useState(centsToDisplay(ops?.balanceOwnerCents));
  const [balanceClientCents, setBalanceClientCents] = useState(centsToDisplay(ops?.balanceClientCents));
  const [crewName, setCrewName] = useState(ops?.crewName ?? "");
  const [opsNote, setOpsNote] = useState(ops?.opsNote ?? "");
  const [contractSigned, setContractSigned] = useState(ops?.contractSigned ?? false);
  const [connected, setConnected] = useState(ops?.connected ?? false);
  const [clientPaid, setClientPaid] = useState(ops?.clientPaid ?? false);
  const [captainPaid, setCaptainPaid] = useState(ops?.captainPaid ?? false);
  const [allPaid, setAllPaid] = useState(ops?.allPaid ?? false);
  const [sheetsSent, setSheetsSent] = useState(ops?.sheetsSent ?? false);
  const [agentCode, setAgentCode] = useState(ops?.agentCode ?? "");
  const [commissionAgentCents, setCommissionAgentCents] = useState(centsToDisplay(ops?.commissionAgentCents));
  const [commissionKosCents, setCommissionKosCents] = useState(centsToDisplay(ops?.commissionKosCents));
  const [sourceOverride, setSourceOverride] = useState(ops?.sourceOverride ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await updateBookingOps(bookingId, {
        expenseCents: parseDollarsToCents(expenseCents),
        gmvCents: parseDollarsToCents(gmvCents),
        revenueCents: parseDollarsToCents(revenueCents),
        paidCents: parseDollarsToCents(paidCents),
        balanceOwnerCents: parseDollarsToCents(balanceOwnerCents),
        balanceClientCents: parseDollarsToCents(balanceClientCents),
        crewName: crewName.trim() || null,
        opsNote: opsNote.trim() || null,
        contractSigned,
        connected,
        clientPaid,
        captainPaid,
        allPaid,
        sheetsSent,
        agentCode: agentCode.trim() || null,
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Ops & Finance</CardTitle>
          <Button size="sm" onClick={handleSubmit} disabled={saving} className="rounded-xl gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Operational fields for reconciliation and reporting.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="crewName">Crew / Captain</Label>
              <Input id="crewName" placeholder="e.g. Jackie, Max" value={crewName} onChange={(e) => setCrewName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opsNote">Note</Label>
              <Input id="opsNote" placeholder="Ops note..." value={opsNote} onChange={(e) => setOpsNote(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentCode">Agent</Label>
              <Input id="agentCode" placeholder="Agent name/code" value={agentCode} onChange={(e) => setAgentCode(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceOverride">Source</Label>
              <Input id="sourceOverride" placeholder="Getmyboat, Boatsetter, Direct, Website..." value={sourceOverride} onChange={(e) => setSourceOverride(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Financial ($)</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="expenseCents">Expense</Label>
                <Input id="expenseCents" type="text" placeholder="0.00" value={expenseCents} onChange={(e) => setExpenseCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmvCents">GMV</Label>
                <Input id="gmvCents" type="text" placeholder="0.00" value={gmvCents} onChange={(e) => setGmvCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenueCents">REV</Label>
                <Input id="revenueCents" type="text" placeholder="0.00" value={revenueCents} onChange={(e) => setRevenueCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidCents">PAID</Label>
                <Input id="paidCents" type="text" placeholder="0.00" value={paidCents} onChange={(e) => setPaidCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceOwnerCents">Balance Owner</Label>
                <Input id="balanceOwnerCents" type="text" placeholder="0.00" value={balanceOwnerCents} onChange={(e) => setBalanceOwnerCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceClientCents">Balance Client</Label>
                <Input id="balanceClientCents" type="text" placeholder="0.00" value={balanceClientCents} onChange={(e) => setBalanceClientCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionAgentCents">Commission Agent</Label>
                <Input id="commissionAgentCents" type="text" placeholder="0.00" value={commissionAgentCents} onChange={(e) => setCommissionAgentCents(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionKosCents">Commission KOS</Label>
                <Input id="commissionKosCents" type="text" placeholder="0.00" value={commissionKosCents} onChange={(e) => setCommissionKosCents(e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { id: "contractSigned", label: "Contract signed", checked: contractSigned, set: setContractSigned },
              { id: "connected", label: "Connected?", checked: connected, set: setConnected },
              { id: "clientPaid", label: "C Paid? (Client)", checked: clientPaid, set: setClientPaid },
              { id: "captainPaid", label: "Capt Paid?", checked: captainPaid, set: setCaptainPaid },
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
        </form>
      </CardContent>
    </Card>
  );
}
