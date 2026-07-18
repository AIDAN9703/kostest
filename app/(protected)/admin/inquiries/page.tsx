import { redirect } from "next/navigation";

/** Inquiries merged into the master bookings view — one list, one vocabulary. */
export default function InquiriesPage() {
  redirect("/admin/bookings");
}
