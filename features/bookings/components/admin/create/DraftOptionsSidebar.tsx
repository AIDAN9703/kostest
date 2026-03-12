"use client";

import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import { formatCurrency } from "@/shared/lib/utils/general-utils";

interface DraftOptionsSidebarProps {
  preview: { name: string; basePrice: number; cleaningFee: number; addOnsTotal: number; total: number; depositAmount: number | null }[];
  allowPayment: boolean;
  onAllowPaymentChange: (v: boolean) => void;
  paymentType: "DEPOSIT_ONLY" | "FULL_PAYMENT";
  onPaymentTypeChange: (v: "DEPOSIT_ONLY" | "FULL_PAYMENT") => void;
  expiresAt: string;
  onExpiresAtChange: (v: string) => void;
  submitLabel: string;
  isPending: boolean;
  error?: string;
}

export function DraftOptionsSidebar({
  preview,
  allowPayment,
  onAllowPaymentChange,
  paymentType,
  onPaymentTypeChange,
  expiresAt,
  onExpiresAtChange,
  submitLabel,
  isPending,
  error,
}: DraftOptionsSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {preview.map((p, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <p className="font-semibold">{p.name}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Base</span>
                  <span>{formatCurrency(p.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning</span>
                  <span>{formatCurrency(p.cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>{formatCurrency(p.addOnsTotal)}</span>
                </div>
                {p.depositAmount != null && p.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Deposit</span>
                    <span>{formatCurrency(p.depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(p.total)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Proposal will be sent automatically to the customer&apos;s email and phone.
            </div>
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">Allow payment</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer can pay when accepting
                  </p>
                </div>
                <Switch checked={allowPayment} onCheckedChange={onAllowPaymentChange} />
              </div>
              {allowPayment && (
                <Select value={paymentType} onValueChange={onPaymentTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_PAYMENT">Full Payment</SelectItem>
                    <SelectItem value="DEPOSIT_ONLY">Deposit Only</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Expiration (optional)</Label>
            <DateTimePicker
              value={expiresAt}
              onChange={onExpiresAtChange}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Creating..." : submitLabel}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
