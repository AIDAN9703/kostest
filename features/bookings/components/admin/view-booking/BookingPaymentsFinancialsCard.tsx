import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import {
  computeEffectiveGmvCents,
  computeOpsRevenueCents,
} from "@/shared/lib/utils/ops-revenue";
import { cn } from "@/shared/lib/utils/general-utils";
import type { BookingDetails } from "@/features/bookings/booking.types";
import type { BookingExpenseLine } from "@/features/bookings/booking-expense.types";
import type { Payment } from "@/database/types";
import { format } from "date-fns";
import { AdminBookingMakePaymentButton } from "@/features/bookings/components/admin/view-booking/AdminBookingMakePaymentButton";
import { BookingAddExpenseButton } from "@/features/bookings/components/admin/view-booking/BookingAddExpenseButton";
import { PaymentLinkActions } from "@/features/bookings/components/admin/view-booking/PaymentLinkActions";

interface BookingPaymentsFinancialsCardProps {
  bookingId: string;
  booking: Pick<
    BookingDetails,
    "totalAmountCents" | "totalPaidCents" | "depositAmountCents" | "currency"
  >;
  payments: Payment[];
  opsGmvCents: number | null;
  opsExpenseCents: number | null;
  commissionAgentCents: number | null;
  commissionKosCents: number | null;
  expenseLines: BookingExpenseLine[];
  /** Stripe payment-link button — on while there's still money to collect. */
  showPaymentLink?: boolean;
  /** Public draft token for the copy-proposal-link button; null hides it. */
  publicToken?: string | null;
}

const METHOD_LABELS: Record<string, string> = {
  STRIPE_CHECKOUT: "Stripe Checkout",
  STRIPE_LINK: "Payment Link",
  STRIPE_INVOICE: "Invoice",
  MANUAL: "Manual / Offline",
  CASH: "Cash",
  CHECK: "Check",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

function formatPaymentType(type: string) {
  const map: Record<string, string> = {
    FULL_PAYMENT: "Full Payment",
    PARTIAL: "Partial",
    DEPOSIT: "Deposit",
    REMAINDER: "Remainder",
    REFUND: "Refund",
    ADJUSTMENT: "Adjustment",
  };
  return map[type] ?? type;
}

/**
 * One money surface for the booking: what the client owes/paid (payments
 * ledger) and what the business makes on it (GMV, expenses, net revenue).
 * Figures are derived — the ways in are "Make payment" (record money
 * received) and "Add expense" (the breakdown editor).
 */
export function BookingPaymentsFinancialsCard({
  bookingId,
  booking,
  payments,
  opsGmvCents,
  opsExpenseCents,
  commissionAgentCents,
  commissionKosCents,
  expenseLines,
  showPaymentLink = false,
  publicToken = null,
}: BookingPaymentsFinancialsCardProps) {
  const totalAmount = booking.totalAmountCents ?? 0;
  const totalPaid = booking.totalPaidCents ?? 0;
  const balance = Math.max(0, totalAmount - totalPaid);
  const bookingCurrency = booking.currency ?? "USD";
  const fmt = (cents: number) => formatCentsAsCurrency(cents, { currency: bookingCurrency });

  const effectiveGmv = computeEffectiveGmvCents(opsGmvCents, booking.totalAmountCents);
  const isOverride =
    opsGmvCents != null &&
    booking.totalAmountCents != null &&
    opsGmvCents !== booking.totalAmountCents;
  const expenses = opsExpenseCents ?? 0;
  const commissions = (commissionAgentCents ?? 0) + (commissionKosCents ?? 0);
  const revenue = computeOpsRevenueCents(opsGmvCents, booking.totalAmountCents, opsExpenseCents);

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Payments &amp; financials</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentLinkActions
              bookingId={bookingId}
              showPaymentLink={showPaymentLink}
              publicToken={publicToken}
            />
            <BookingAddExpenseButton
              bookingId={bookingId}
              totalAmountCents={booking.totalAmountCents ?? null}
              opsGmvCents={opsGmvCents}
              currency={bookingCurrency}
              initialLines={expenseLines}
            />
            <AdminBookingMakePaymentButton
              bookingId={bookingId}
              charterTotalCents={booking.totalAmountCents ?? null}
              totalPaidFromPaymentsCents={booking.totalPaidCents ?? 0}
              opsGmvCents={opsGmvCents}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client money */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryItem label="Total Due" value={fmt(totalAmount)} />
          <SummaryItem
            label="Total Paid"
            value={fmt(totalPaid)}
            className={totalPaid > 0 ? "text-success" : undefined}
          />
          <SummaryItem
            label="Balance"
            value={fmt(balance)}
            className={balance > 0 ? "text-warning" : undefined}
          />
          {booking.depositAmountCents != null && booking.depositAmountCents > 0 ? (
            <SummaryItem label="Deposit Required" value={fmt(booking.depositAmountCents)} />
          ) : null}
        </div>

        {/* Business money */}
        <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-5 sm:grid-cols-4">
          <SummaryItem
            label="GMV"
            caption={isOverride ? "Override" : undefined}
            value={effectiveGmv != null ? fmt(effectiveGmv) : "—"}
          />
          <SummaryItem label="Expenses" value={expenses > 0 ? fmt(expenses) : "—"} />
          <SummaryItem label="Commissions" value={commissions > 0 ? fmt(commissions) : "—"} />
          <SummaryItem
            label="Net Revenue"
            value={revenue != null ? fmt(revenue) : "—"}
            className={
              revenue == null ? undefined : revenue >= 0 ? "text-success" : "text-destructive"
            }
          />
        </div>

        {/* Payment history */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment History
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment records yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap px-3 py-2">
                        {format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-3 py-2">{formatPaymentType(p.paymentType)}</td>
                      <td className="px-3 py-2">
                        {METHOD_LABELS[p.paymentMethodType] ?? p.paymentMethodType}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 py-2 text-right font-medium",
                          p.paymentType === "REFUND" ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {p.paymentType === "REFUND" ? "−" : ""}
                        {formatCentsAsCurrency(Number(p.amountCents), {
                          currency: p.currency ?? bookingCurrency,
                        })}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {expenseLines.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {expenseLines.length} expense {expenseLines.length === 1 ? "line" : "lines"} — open
              the breakdown to review or edit.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  caption,
  value,
  className,
}: {
  label: string;
  caption?: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {caption ? (
          <span className="rounded-sm bg-muted px-1 py-0.5 text-[9px] font-medium normal-case tracking-normal">
            {caption}
          </span>
        ) : null}
      </p>
      <p className={cn("text-lg font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}
