import { GroupBookingForm } from "@/features/bookings/components/admin/booking-forms/GroupBookingForm";
import { boatService } from "@/features/boats/boat.service";

export default async function AdminBookingCreateGroupPage() {
  const pricingTiers = await boatService.getAllActivePricingTiers();
  return <GroupBookingForm pricingTiers={pricingTiers} />;
}
