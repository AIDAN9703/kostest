import AdminAddUpdateBoatForm from "@/features/boats/components/forms/admin-create-edit-boat-form";
import { addOnService } from "@/features/add-ons/add-on.service";

export default async function AdminCreateBoatPage() {
  const availableAddOns = await addOnService.getActiveAddOns();
  return <AdminAddUpdateBoatForm availableAddOns={availableAddOns} />;
}
