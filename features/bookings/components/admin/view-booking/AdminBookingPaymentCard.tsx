import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { BookingDetails } from "@/features/bookings/booking.types";
import type { Payment } from "@/database/types";
import { format } from "date-fns";
import { AdminBookingMakePaymentButton } from "@/features/bookings/components/admin/view-booking/AdminBookingMakePaymentButton";

interface AdminBookingPaymentCardProps {
  bookingId: string;
  booking: Pick<
    BookingDetails,
    "totalAmountCents" | "totalPaidCents" | "depositAmountCents" | "currency"
  >;
  payments: Payment[];
  opsGmvCents: number | null;
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

export function AdminBookingPaymentCard({
  bookingId,
  booking,
  payments,
  opsGmvCents,
}: AdminBookingPaymentCardProps) {
  const totalAmount = booking.totalAmountCents ?? 0;
  const totalPaid = booking.totalPaidCents ?? 0;
  const balance = Math.max(0, totalAmount - totalPaid);
  const bookingCurrency = booking.currency ?? "USD";
  const fmtBooking = (cents: number) =>
    formatCentsAsCurrency(cents, { currency: bookingCurrency });

  return (
    <Card className="h-full rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Payment</CardTitle>
          <AdminBookingMakePaymentButton
            bookingId={bookingId}
            charterTotalCents={booking.totalAmountCents ?? null}
            totalPaidFromPaymentsCents={booking.totalPaidCents ?? 0}
            opsGmvCents={opsGmvCents}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xs text-muted-foreground">
          Due / paid / balance use the <strong>payment ledger</strong> below.{' '}
          <strong>Make payment</strong> records a manual offline payment and updates ops PAID when
          the total reaches GMV (or the quote total if GMV is not set).
        </p>
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryItem
            label="Total Due"
            value={fmtBooking(totalAmount)}
          />
          <SummaryItem
            label="Total Paid"
            value={fmtBooking(totalPaid)}
            className={totalPaid > 0 ? "text-green-700" : undefined}
          />
          <SummaryItem
            label="Balance"
            value={fmtBooking(balance)}
            className={balance > 0 ? "text-amber-600" : undefined}
          />
          {booking.depositAmountCents != null &&
            booking.depositAmountCents > 0 && (
              <SummaryItem
                label="Deposit Required"
                value={fmtBooking(booking.depositAmountCents)}
              />
            )}
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
