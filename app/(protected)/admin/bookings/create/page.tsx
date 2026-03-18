import { SingleBookingForm } from "@/features/bookings/components/admin/booking-forms/SingleBookingForm";
import { boatService } from "@/features/boats/boat.service";

export default async function AdminBookingCreatePage() {
  const pricingTiers = await boatService.getAllActivePricingTiers();
  return <SingleBookingForm pricingTiers={pricingTiers} />;
}
