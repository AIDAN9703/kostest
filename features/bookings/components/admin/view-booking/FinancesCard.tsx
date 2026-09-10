import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils/general-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { Payment } from "@/database/types";
import type { BookingAddOn } from "@/features/bookings/booking.types";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";
import type { CustomerMoney } from "@/features/bookings/lib/booking-money";
import { AdminBookingMakePaymentButton } from "./AdminBookingMakePaymentButton";
import { BookingAddExpenseButton } from "./BookingAddExpenseButton";

const METHOD_LABELS: Record<string, string> = {
  STRIPE_CHECKOUT: "Card",
  STRIPE_LINK: "Card",
  STRIPE_INVOICE: "Card (invoice)",
  MANUAL: "Off-card",
};

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit",
  FULL_PAYMENT: "Full payment",
  PARTIAL: "Partial payment",
  ADDITIONAL: "Additional charge",
  REFUND: "Refund",
};

export interface FinancesLines {
  boatName: string | null;
  basePriceCents: number;
  captainFeeCents: number;
  cleaningFeeCents: number;
  addOns: BookingAddOn[];
}

/**
 * The customer's money, top to bottom the way an admin reads it: what they
 * owe → what they've paid → the payments behind it. One line per payment;
 * card payments open in Stripe. Add expense lives here too (it's money);
 * what KOS makes is read in CommissionCard.
 */
export function FinancesCard({
  bookingId,
  isInquiry,
  money,
  lines,
  payments,
  expenseLines,
  opsGmvCents,
  totalAmountCents,
  serviceFeeCents,
  currency,
  estimatedValueCents,
  budgetCents,
  stripeDashboardBase,
}: {
  bookingId: string;
  isInquiry: boolean;
  money: CustomerMoney;
  lines: FinancesLines;
  payments: Payment[];
  /** For the Add expense editor (the totals show in Commission). */
  expenseLines: BookingExpenseLine[];
  opsGmvCents: number | null;
  totalAmountCents: number | null;
  serviceFeeCents: number | null;
  currency: string;
  estimatedValueCents: number | null;
  budgetCents: number | null;
  /** https://dashboard.stripe.com or …/test — decided by the live key. */
  stripeDashboardBase: string;
}) {
  const fmt = (c: number) => formatCentsAsCurrency(c, { currency });

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Finances</CardTitle>
          {!isInquiry ? (
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
          ) : null}
        </div>
      </CardHeader>

      {isInquiry ? (
        <CardContent className="space-y-3">
          <dl className="space-y-1.5 text-sm">
            <Row label="Est. charter value" value={estimatedValueCents != null ? fmt(estimatedValueCents) : "—"} />
            <Row label="Customer budget" value={budgetCents != null ? fmt(budgetCents) : "—"} muted />
          </dl>
          <p className="text-xs text-muted-foreground">
            Price the trip with Create proposal and the full breakdown appears here.
          </p>
        </CardContent>
      ) : (
        <CardContent className="space-y-6">
          {/* ── What the customer owes ── */}
          <section>
            <SectionLabel>Breakdown</SectionLabel>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row label={lines.boatName ?? "Charter"} value={fmt(lines.basePriceCents)} />
              {lines.addOns.map((a, i) => (
                <Row
                  key={i}
                  label={`${a.name}${a.quantity > 1 ? ` × ${a.quantity}` : ""}`}
                  value={fmt(Math.round(a.total * 100))}
                  muted
                />
              ))}
              {lines.captainFeeCents > 0 ? <Row label="Captain" value={fmt(lines.captainFeeCents)} muted /> : null}
              {lines.cleaningFeeCents > 0 ? <Row label="Cleaning" value={fmt(lines.cleaningFeeCents)} muted /> : null}
              <Row
                label={money.serviceFeeWaived ? "Card fee · waived" : "Card fee"}
                value={fmt(money.serviceFeeCents)}
                muted
                strike={money.serviceFeeWaived}
              />
              <Divider />
              <Row label="Total" value={fmt(money.totalCents)} strong />
              <Row label="Paid" value={fmt(money.paidCents)} tone={money.paidCents > 0 ? "success" : undefined} />
              <Row
                label={money.balanceCents > 0 ? "Balance due" : "Balance"}
                value={money.balanceCents > 0 ? fmt(money.balanceCents) : "Settled"}
                tone={money.balanceCents > 0 ? "warning" : "success"}
                strong
              />
              {money.depositCents && money.paidCents === 0 ? (
                <Row label="Deposit to secure" value={fmt(money.depositCents)} muted />
              ) : null}
            </dl>
          </section>

          {/* ── The ledger ── */}
          <section>
            <SectionLabel>Payments</SectionLabel>
            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <ul className="mt-1 divide-y divide-border/50">
                {payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} currency={currency} stripeDashboardBase={stripeDashboardBase} />
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      )}
    </Card>
  );
}

function PaymentRow({
  payment: p,
  currency,
  stripeDashboardBase,
}: {
  payment: Payment;
  currency: string;
  stripeDashboardBase: string;
}) {
  const isRefund = p.paymentType === "REFUND";
  const amount = formatCentsAsCurrency(Number(p.amountCents), { currency: p.currency ?? currency });
  const method = p.paymentMethodDetail ?? METHOD_LABELS[p.paymentMethodType] ?? p.paymentMethodType;
  const when = format(new Date(p.processedAt ?? p.createdAt), "MMM d, yyyy");
  const settled = p.status === "SUCCEEDED";
  const href = p.stripePaymentIntentId ? `${stripeDashboardBase}/payments/${p.stripePaymentIntentId}` : null;

  const body = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {TYPE_LABELS[p.paymentType] ?? p.paymentType}
          <span className="text-muted-foreground"> · {method}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {when}
          {!settled ? ` · ${p.status.toLowerCase()}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn("text-sm font-semibold tabular-nums", isRefund && "text-destructive", !settled && "text-muted-foreground")}>
          {isRefund ? "−" : ""}
          {amount}
        </span>
        {href ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /> : null}
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Stripe"
          className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/40"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-center justify-between gap-3 py-2.5">{body}</div>
      )}
    </li>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="my-2 border-t border-border/50" role="presentation" />;
}

function Row({
  label,
  value,
  muted,
  strong,
  strike,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  strike?: boolean;
  tone?: "success" | "warning" | "destructive";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("truncate", muted ? "text-muted-foreground" : "text-foreground", strong && "font-semibold")}>
        {label}
      </dt>
      <dd
        className={cn(
          "shrink-0 tabular-nums",
          muted && !tone && "text-muted-foreground",
          strong && "font-semibold",
          strike && "line-through opacity-60",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "destructive" && "text-destructive"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
