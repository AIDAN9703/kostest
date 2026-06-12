import { Suspense } from "react";
import { auth } from "@/auth";
import BookingDetailsClient from "@/features/bookings/components/BookingDetailsClient";
import { getAppSettings } from "@/features/app-settings/app-settings.service";

export default async function BookingDetailsPage() {
  const [session, settings] = await Promise.all([auth(), getAppSettings()]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    }>
      <BookingDetailsClient
        user={session?.user || null}
        serviceFeeRate={settings.serviceFeeRate}
        holdMinutes={settings.bookingHoldMinutes}
      />
    </Suspense>
  );
}

