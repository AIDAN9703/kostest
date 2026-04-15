import { SingleBookingForm } from "@/features/bookings/components/admin/booking-forms/SingleBookingForm";
import { boatService } from "@/features/boats/boat.service";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { buildInquiryPrefillForBookingForm } from "@/features/inquiries/inquiry-booking-prefill";

type Props = {
  searchParams: Promise<{ inquiryId?: string }>;
};

export default async function AdminBookingCreatePage({ searchParams }: Props) {
  const { inquiryId } = await searchParams;
  const trimmed = inquiryId?.trim();

  const [pricingTiers, inquiry] = await Promise.all([
    boatService.getAllActivePricingTiers(),
    trimmed ? inquiryService.getInquiryById(trimmed) : Promise.resolve(null),
  ]);

  const inquiryPrefill = inquiry ? buildInquiryPrefillForBookingForm(inquiry) : null;

  return <SingleBookingForm pricingTiers={pricingTiers} inquiryPrefill={inquiryPrefill} />;
}
