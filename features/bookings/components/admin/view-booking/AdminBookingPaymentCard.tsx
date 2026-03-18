import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { SERVICE_FEE_PERCENT_DISPLAY } from "@/shared/lib/constants/fees-constants";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { BookingDetails } from "@/features/bookings/booking.types";
import type { Payment } from "@/database/types";
import { format } from "date-fns";

interface AdminBookingPaymentCardProps {
  booking: Pick<
    BookingDetails,
    | "paymentDisplayStatus"
    | "paymentMethod"
    | "totalAmountCents"
    | "totalPaidCents"
    | "basePriceCents"
    | "captainFeeCents"
    | "cleaningFeeCents"
    | "serviceFeeCents"
    | "taxAmountCents"
    | "depositAmountCents"
  >;
  payments: Payment[];
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
    DEPOSIT: "Deposit",
    REMAINDER: "Remainder",
    REFUND: "Refund",
    ADJUSTMENT: "Adjustment",
  };
  return map[type] ?? type;
}

export function AdminBookingPaymentCard({
  booking,
  payments,
}: AdminBookingPaymentCardProps) {
  const totalAmount = booking.totalAmountCents ?? 0;
  const totalPaid = booking.totalPaidCents ?? 0;
  const balance = Math.max(0, totalAmount - totalPaid);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Payment Information</CardTitle>
          <StatusBadge status={booking.paymentDisplayStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryItem
            label="Total Due"
            value={formatCentsAsCurrency(totalAmount)}
          />
          <SummaryItem
            label="Total Paid"
            value={formatCentsAsCurrency(totalPaid)}
            className={totalPaid > 0 ? "text-green-700" : undefined}
          />
          <SummaryItem
            label="Balance"
            value={formatCentsAsCurrency(balance)}
            className={balance > 0 ? "text-amber-600" : undefined}
          />
          {booking.depositAmountCents != null &&
            booking.depositAmountCents > 0 && (
              <SummaryItem
                label="Deposit Required"
                value={formatCentsAsCurrency(booking.depositAmountCents)}
              />
            )}
        </div>

        {/* Pricing breakdown */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pricing Breakdown
          </h3>
          <div className="divide-y rounded-lg border text-sm">
            <LineItem label="Base Price" cents={booking.basePriceCents} />
            <LineItem label="Captain Fee" cents={booking.captainFeeCents} />
            <LineItem label="Cleaning Fee" cents={booking.cleaningFeeCents} />
            <LineItem
              label={`Card Processing Fee (${SERVICE_FEE_PERCENT_DISPLAY}%)`}
              cents={booking.serviceFeeCents}
            />
            <LineItem label="Tax" cents={booking.taxAmountCents} />
            <div className="flex justify-between px-3 py-2 font-semibold">
              <span>Total</span>
              <span>{formatCentsAsCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment history */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payment History
          </h3>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment records yet.
            </p>
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
                      <td className="px-3 py-2">
                        {formatPaymentType(p.paymentType)}
                      </td>
                      <td className="px-3 py-2">
                        {METHOD_LABELS[p.paymentMethodType] ??
                          p.paymentMethodType}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-medium ${
                          p.paymentType === "REFUND"
                            ? "text-red-600"
                            : "text-foreground"
                        }`}
                      >
                        {p.paymentType === "REFUND" ? "−" : ""}
                        {formatCentsAsCurrency(Number(p.amountCents))}
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
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`text-lg font-semibold ${className ?? ""}`}>{value}</p>
    </div>
  );
}

function LineItem({
  label,
  cents,
}: {
  label: string;
  cents: number | null | undefined;
}) {
  if (cents == null || cents === 0) return null;
  return (
    <div className="flex justify-between px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span>{formatCentsAsCurrency(cents)}</span>
    </div>
  );
}
