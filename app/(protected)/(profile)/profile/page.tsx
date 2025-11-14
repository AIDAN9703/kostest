import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to bookings page as the default
  redirect("/profile/settings");
}
