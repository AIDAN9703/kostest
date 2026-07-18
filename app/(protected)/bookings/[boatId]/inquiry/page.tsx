import { Suspense } from "react";

import { getAppSettings } from "@/features/app-settings/app-settings.service";
import BoatInquiryDetailsClient from "@/features/bookings/components/lead-intake/BoatInquiryDetailsClient";

export default async function BoatInquiryPage() {
  const settings = await getAppSettings();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <BoatInquiryDetailsClient serviceFeeRate={settings.serviceFeeRate} />
    </Suspense>
  );
}
