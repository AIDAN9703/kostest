"use client";

import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatCurrency } from "@/shared/lib/utils/general-utils";

interface DraftOptionsSidebarProps {
  preview: {
    name: string;
    basePrice: number;
    cleaningFee: number;
    addOnsTotal: number;
    total: number;
    depositAmount: number | null;
  }[];
  allowPayment: boolean;
  onAllowPaymentChange: (v: boolean) => void;
  paymentType: "DEPOSIT_ONLY" | "FULL_PAYMENT";
  onPaymentTypeChange: (v: "DEPOSIT_ONLY" | "FULL_PAYMENT") => void;
  sendProposalEmail: boolean;
  onSendProposalEmailChange: (v: boolean) => void;
  sendProposalSms: boolean;
  onSendProposalSmsChange: (v: boolean) => void;
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
  sendProposalEmail,
  onSendProposalEmailChange,
  sendProposalSms,
  onSendProposalSmsChange,
  submitLabel,
  isPending,
  error,
}: DraftOptionsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* gap-3/py-5 tighten the base Card's gap-6/py-6 around the title */}
      <Card className="gap-3 py-5">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {preview.map((p, index) => (
            <div key={index} className="rounded-lg border bg-muted/30 p-3">
              <p className="font-semibold">{p.name}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
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

          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">Allow payment</span>
                <p className="text-xs text-muted-foreground">Customer can pay when accepting</p>
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

          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Send proposal to customer</p>
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="send-email" className="font-normal">
                Email
              </Label>
              <Switch
                id="send-email"
                checked={sendProposalEmail}
                onCheckedChange={onSendProposalEmailChange}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="send-sms" className="font-normal">
                SMS
              </Label>
              <Switch
                id="send-sms"
                checked={sendProposalSms}
                onCheckedChange={onSendProposalSmsChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-11 w-full rounded-full text-[15px] font-semibold"
      >
        {isPending ? "Creating..." : submitLabel}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
