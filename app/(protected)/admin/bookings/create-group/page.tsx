import { GroupBookingForm } from "@/features/bookings/components/admin/create/GroupBookingForm";
import { getCreateBookingFormData } from "@/features/bookings/lib/get-create-form-data";

export default async function AdminBookingCreateGroupPage() {
  const { pricingTiers } = await getCreateBookingFormData(null);

  return <GroupBookingForm pricingTiers={pricingTiers} />;
}
