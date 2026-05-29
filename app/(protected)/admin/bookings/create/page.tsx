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
    <SingleBookingForm
      pricingTiers={pricingTiers}
      inquiryPrefill={inquiryPrefill}
      datePrefill={datePrefill}
    />
  );
}
