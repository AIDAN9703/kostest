"use client";

import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { Payment } from "@/database/types";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";
import type { CustomerMoney, DealEconomics } from "@/features/bookings/lib/booking-money";
import { AdminBookingMakePaymentButton } from "./AdminBookingMakePaymentButton";
import { BookingAddExpenseButton } from "./BookingAddExpenseButton";

const METHOD_LABELS: Record<string, string> = {
  STRIPE_CHECKOUT: "Card (Stripe)",
  STRIPE_LINK: "Card (payment link)",
  STRIPE_INVOICE: "Card (invoice)",
  MANUAL: "Off-card",
};

function typeLabel(t: string) {
  return t.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * What KOS makes on this deal — GMV, expenses, commission, net — plus the
 * payment ledger. Customer-facing money (total / paid / balance) lives in the
 * ProposalDialog (Resend / after an update), where the customer sees the same
 * numbers.
 */
export function DealEconomicsCard({
  bookingId,
  money,
  economics,
  payments,
  expenseLines,
  opsGmvCents,
  totalAmountCents,
  serviceFeeCents,
  currency,
}: {
  bookingId: string;
  money: CustomerMoney;
  economics: DealEconomics;
  payments: Payment[];
  expenseLines: BookingExpenseLine[];
  opsGmvCents: number | null;
  totalAmountCents: number | null;
  serviceFeeCents: number | null;
  currency: string;
}) {
  const fmt = (c: number) => formatCentsAsCurrency(c, { currency });

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Deal economics</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <BookingAddExpenseButton
              bookingId={bookingId}
              totalAmountCents={totalAmountCents}
              serviceFeeCents={serviceFeeCents}
              opsGmvCents={opsGmvCents}
              currency={currency}
              initialLines={expenseLines}
            />
            <AdminBookingMakePaymentButton bookingId={bookingId} money={money} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="GMV" caption={economics.gmvOverridden ? "Override" : undefined} value={economics.gmvCents != null ? fmt(economics.gmvCents) : "—"} />
          <Stat label="Expenses" value={economics.expenseCents > 0 ? fmt(economics.expenseCents) : "—"} />
          <Stat label="Commissions" value={economics.commissionCents > 0 ? fmt(economics.commissionCents) : "—"} />
          <Stat
            label="Net revenue"
            value={economics.revenueCents != null ? fmt(economics.revenueCents) : "—"}
            className={economics.revenueCents == null ? undefined : economics.revenueCents >= 0 ? "text-success" : "text-destructive"}
          />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payments</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap px-3 py-2">{format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}</td>
                      <td className="px-3 py-2">{typeLabel(p.paymentType)}</td>
                      <td className="px-3 py-2">
                        {p.paymentMethodDetail ?? METHOD_LABELS[p.paymentMethodType] ?? p.paymentMethodType}
                      </td>
                      <td className={cn("whitespace-nowrap px-3 py-2 text-right font-medium", p.paymentType === "REFUND" ? "text-destructive" : "text-foreground")}>
                        {p.paymentType === "REFUND" ? "−" : ""}
                        {formatCentsAsCurrency(Number(p.amountCents), { currency: p.currency ?? currency })}
                        {p.status !== "SUCCEEDED" ? <span className="ml-2 text-xs text-muted-foreground">{p.status.toLowerCase()}</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {expenseLines.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {expenseLines.length} expense {expenseLines.length === 1 ? "line" : "lines"} — open the breakdown to review or edit.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, caption, value, className }: { label: string; caption?: string; value: string; className?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {caption ? <span className="rounded-sm bg-muted px-1 py-0.5 text-[9px] font-medium normal-case tracking-normal">{caption}</span> : null}
      </p>
      <p className={cn("text-lg font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}
