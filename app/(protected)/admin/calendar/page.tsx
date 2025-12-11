import { redirect } from "next/navigation";

// Redirect to the new unified booking portal with calendar tab
export default async function AdminCalendarPage() {
  redirect("/admin/bookings/portal?tab=calendar");
}
