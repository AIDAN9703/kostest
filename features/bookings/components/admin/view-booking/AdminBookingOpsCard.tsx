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
  const [revenueCents, setRevenueCents] = useState(centsToDisplay(ops?.revenueCents));
  const [balanceOwnerCents, setBalanceOwnerCents] = useState(
    centsToDisplay(ops?.balanceOwnerCents)
  );
  const [crewName, setCrewName] = useState(ops?.crewName ?? "");
  const [contractSigned, setContractSigned] = useState(ops?.contractSigned ?? false);
  const [captainPaid, setCaptainPaid] = useState(ops?.captainPaid ?? false);
  const [commissionCents, setCommissionCents] = useState(centsToDisplay(ops?.commissionCents));
  const [sourceOverride, setSourceOverride] = useState(ops?.sourceOverride ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await updateBookingOps(bookingId, {
        expenseCents: parseDollarsToCents(expenseCents),
        revenueCents: parseDollarsToCents(revenueCents),
        balanceOwnerCents: parseDollarsToCents(balanceOwnerCents),
        crewName: crewName.trim() || null,
        contractSigned,
        captainPaid,
        commissionCents: parseDollarsToCents(commissionCents),
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
              <Input
                id="crewName"
                type="text"
                placeholder="e.g. Jackie, Max"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceOverride">Source</Label>
              <Input
                id="sourceOverride"
                type="text"
                placeholder="Getmyboat, Boatsetter, Direct, Website..."
                value={sourceOverride}
                onChange={(e) => setSourceOverride(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Financial ($)</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expenseCents">Expense</Label>
                <Input
                  id="expenseCents"
                  type="text"
                  placeholder="0.00"
                  value={expenseCents}
                  onChange={(e) => setExpenseCents(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenueCents">Revenue</Label>
                <Input
                  id="revenueCents"
                  type="text"
                  placeholder="0.00"
                  value={revenueCents}
                  onChange={(e) => setRevenueCents(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceOwnerCents">Balance Owner</Label>
                <Input
                  id="balanceOwnerCents"
                  type="text"
                  placeholder="0.00"
                  value={balanceOwnerCents}
                  onChange={(e) => setBalanceOwnerCents(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionCents">Commission</Label>
                <Input
                  id="commissionCents"
                  type="text"
                  placeholder="0.00"
                  value={commissionCents}
                  onChange={(e) => setCommissionCents(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contractSigned"
                checked={contractSigned}
                onCheckedChange={(v) => setContractSigned(v === true)}
              />
              <Label
                htmlFor="contractSigned"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Contract signed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="captainPaid"
                checked={captainPaid}
                onCheckedChange={(v) => setCaptainPaid(v === true)}
              />
              <Label
                htmlFor="captainPaid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Captain paid
              </Label>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
