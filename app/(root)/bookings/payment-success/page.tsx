import { Suspense } from "react";
import PaymentSuccessClient from "@/features/bookings/components/PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-gray-600">Confirming your payment...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
