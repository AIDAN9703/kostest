import { GroupBookingForm } from "@/features/bookings/components/admin/booking-forms/GroupBookingForm";
import { boatService } from "@/features/boats/boat.service";

export default async function AdminBookingCreateGroupPage() {
  const pricingTiers = await boatService.getAllActivePricingTiers();
  return (
    <div className="flex w-full flex-1 flex-col gap-5 pb-8">
      <header className="pt-1">
        <h1 className="text-2xl font-semibold tracking-tight">New group booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft multiple boats under one group, optionally sending the customer a single proposal.
        </p>
      </header>
      <GroupBookingForm pricingTiers={pricingTiers} />
    </div>
  );
}
