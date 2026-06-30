import { redirect } from "next/navigation";

export default function AdminCaptainsRedirectPage() {
  redirect("/admin/crew?tab=captains");
}
