import { redirect } from "next/navigation";

// Redirect to the new unified booking portal with inquiries tab
export default async function InquiriesPage() {
  redirect("/admin/bookings/portal?tab=inquiries");
}
