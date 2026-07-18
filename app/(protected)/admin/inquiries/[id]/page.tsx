import { redirect } from "next/navigation";

/** Inquiry details now live on the unified deal page under bookings. */
export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/bookings/${id}`);
}
