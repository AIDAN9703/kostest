import { SingleBookingForm } from "@/features/bookings/components/admin/booking-forms/SingleBookingForm";
import { boatService } from "@/features/boats/boat.service";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { buildInquiryPrefillForBookingForm } from "@/features/inquiries/inquiry-booking-prefill";
import { buildDatePrefillForBookingForm } from "@/features/bookings/lib/booking-create-date-prefill";

type Props = {
  searchParams: Promise<{ inquiryId?: string; date?: string }>;
};

export default async function AdminBookingCreatePage({ searchParams }: Props) {
  const { inquiryId, date } = await searchParams;
  const trimmed = inquiryId?.trim();

  const [pricingTiers, inquiry] = await Promise.all([
    boatService.getAllActivePricingTiers(),
    trimmed ? inquiryService.getInquiryById(trimmed) : Promise.resolve(null),
  ]);

  const inquiryPrefill = inquiry ? buildInquiryPrefillForBookingForm(inquiry) : null;
  const datePrefill =
    !inquiryPrefill && date?.trim() ? buildDatePrefillForBookingForm(date.trim()) : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-5 pb-8">
      <header className="pt-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {inquiryPrefill
            ? `New proposal for ${inquiryPrefill.customerName}`
            : "New booking"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {inquiryPrefill
            ? "Price the trip and send it — the customer accepts and pays from their link."
            : "Create a draft booking, optionally sending it to the customer as a proposal."}
        </p>
      </header>
      <SingleBookingForm
        pricingTiers={pricingTiers}
        inquiryPrefill={inquiryPrefill}
        datePrefill={datePrefill}
      />
    </div>
  );
}
