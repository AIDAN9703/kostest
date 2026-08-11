import { redirect } from "next/navigation";

import { ProposalForm } from "@/features/bookings/components/admin/booking-forms/ProposalForm";
import { SingleBookingForm } from "@/features/bookings/components/admin/booking-forms/SingleBookingForm";
import { boatService } from "@/features/boats/boat.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { buildDealPrefillForBookingForm } from "@/features/bookings/lib/deal-prefill";
import { buildDatePrefillForBookingForm } from "@/features/bookings/lib/booking-create-date-prefill";

type Props = {
  /** `dealId` prices an INQUIRY deal into a proposal (upgrades that row).
   *  `inquiryId` is the legacy spelling — same ids post-migration. */
  searchParams: Promise<{ dealId?: string; inquiryId?: string; date?: string }>;
};

export default async function AdminBookingCreatePage({ searchParams }: Props) {
  const { dealId, inquiryId, date } = await searchParams;
  const targetDealId = (dealId ?? inquiryId)?.trim();

  const [pricingTiers, deal] = await Promise.all([
    boatService.getAllActivePricingTiers(),
    targetDealId ? bookingService.getBookingById(targetDealId) : Promise.resolve(null),
  ]);

  // Only INQUIRY-status deals get priced through this form. A deal that's
  // already past inquiry has its own trip/pricing — send the admin there
  // instead of silently showing a blank form that would fork a new booking.
  if (deal && deal.bookingStatus !== "INQUIRY") {
    redirect(`/admin/bookings/${deal.id}`);
  }
  const dealPrefill = deal ? buildDealPrefillForBookingForm(deal) : null;
  const datePrefill =
    !dealPrefill && date?.trim() ? buildDatePrefillForBookingForm(date.trim()) : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-5 pb-8">
      <header className="pt-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {dealPrefill ? `New proposal for ${dealPrefill.customerName}` : "New booking"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dealPrefill
            ? "Price the trip and send it — the customer accepts and pays from their link."
            : "Create a draft booking, optionally sending it to the customer as a proposal."}
        </p>
      </header>
      {dealPrefill ? (
        /* Same tailored form the deal page's modal hosts — one proposal
           experience everywhere. */
        <ProposalForm pricingTiers={pricingTiers} dealPrefill={dealPrefill} />
      ) : (
        <SingleBookingForm pricingTiers={pricingTiers} datePrefill={datePrefill} />
      )}
    </div>
  );
}
