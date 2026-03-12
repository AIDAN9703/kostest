import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingPaymentCardProps {
  booking: Pick<
    BookingDetails,
    | "paymentStatus"
    | "paymentMethod"
    | "totalAmountCents"
    | "basePriceCents"
    | "captainFeeCents"
    | "cleaningFeeCents"
    | "serviceFeeCents"
    | "taxAmountCents"
  >;
}

export function AdminBookingPaymentCard({ booking }: AdminBookingPaymentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Payment Information</CardTitle>
          {booking.paymentStatus && (
            <StatusBadge status={booking.paymentStatus} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Payment Method
            </h3>
            <p className="text-sm font-medium">
              {booking.paymentMethod || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total Amount
            </h3>
            <p className="text-sm font-medium">
              {formatCentsAsCurrency(booking.totalAmountCents)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Calculated from base price + fees
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Base Price
            </h3>
            <p className="text-sm font-medium">
              {booking.basePriceCents
                ? formatCentsAsCurrency(booking.basePriceCents)
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Captain Fee
            </h3>
            <p className="text-sm font-medium">
              {booking.captainFeeCents
                ? formatCentsAsCurrency(booking.captainFeeCents)
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cleaning Fee
            </h3>
            <p className="text-sm font-medium">
              {booking.cleaningFeeCents
                ? formatCentsAsCurrency(booking.cleaningFeeCents)
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Card Processing Fee
            </h3>
            <p className="text-sm font-medium">
              {booking.serviceFeeCents
                ? formatCentsAsCurrency(booking.serviceFeeCents)
                : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Calculated automatically (3.5% of subtotal)
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tax
            </h3>
            <p className="text-sm font-medium">
              {booking.taxAmountCents
                ? formatCentsAsCurrency(booking.taxAmountCents)
                : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
