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

  // Only INQUIRY-status deals get priced through this form; anything further
  // along already has its own trip/pricing on the detail page.
  const dealPrefill =
    deal && deal.bookingStatus === "INQUIRY" ? buildDealPrefillForBookingForm(deal) : null;
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
      <SingleBookingForm
        pricingTiers={pricingTiers}
        dealPrefill={dealPrefill}
        datePrefill={datePrefill}
      />
    </div>
  );
}
