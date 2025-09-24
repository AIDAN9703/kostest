import { redirect } from "next/navigation";

// Redirect to the new unified booking portal
export default async function BookingsPage() {
  redirect("/admin/bookings/portal");
}
