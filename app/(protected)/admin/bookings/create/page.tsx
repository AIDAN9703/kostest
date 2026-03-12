import { SingleBookingForm } from "@/features/bookings/components/admin/create/SingleBookingForm";
import { getCreateBookingFormData } from "@/features/bookings/lib/get-create-form-data";

type PageProps = {
  searchParams: Promise<{ inquiryId?: string }>;
};

export default async function AdminBookingCreatePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { pricingTiers, inquiryId, inquiryPrefill } =
    await getCreateBookingFormData(params.inquiryId ?? null);

  return (
    <SingleBookingForm
      pricingTiers={pricingTiers}
      inquiryId={inquiryId}
      inquiryPrefill={inquiryPrefill}
    />
  );
}
